using Api.Models;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using Api.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<JwtTokenService>();

var jwt = builder.Configuration.GetSection("Jwt");
var jwtKey = jwt["Key"]!;
var jwtIssuer = jwt["Issuer"]!;
var jwtAudience = jwt["Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(2),
        };
    });

builder.Services.AddAuthorization();

var cs = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

var app = builder.Build();

app.UseCors("dev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}




app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

var tasksGroup = app.MapGroup("/api/tasks")
                    .RequireAuthorization();

tasksGroup.MapGet("", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);

    var entities = await db.Tasks
        .Where(t => t.UserId == userId)
        .ToListAsync();

    return entities.Select(t => new TaskItem(t.Id, t.Title, t.IsDone));
});

app.MapPost("/api/auth/register", async (AuthRequest req, AppDbContext db, JwtTokenService jwtSvc) =>
{
    var email = req.Email.Trim().ToLowerInvariant();
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest("Email and password are required.");

    var exists = await db.Users.AnyAsync(u => u.Email == email);
    if (exists) return Results.Conflict("Email already registered.");

    PasswordHasher.CreateHash(req.Password, out var hash, out var salt);

    var user = new UserEntity
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = hash,
        PasswordSalt = salt
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    var token = jwtSvc.CreateToken(user);
    return Results.Ok(new AuthResponse(token));
});

tasksGroup.MapPost("", async (CreateTaskRequest req, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);

    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest("Title is required.");

    var entity = new TaskEntity
    {
        Id = Guid.NewGuid(),
        Title = req.Title.Trim(),
        IsDone = false,
        UserId = userId
    };

    db.Tasks.Add(entity);
    await db.SaveChangesAsync();

    return Results.Created($"/api/tasks/{entity.Id}",
        new TaskItem(entity.Id, entity.Title, entity.IsDone));
});

app.MapPost("/api/auth/login", async (AuthRequest req, AppDbContext db, JwtTokenService jwtSvc) =>
{
    var email = req.Email.Trim().ToLowerInvariant();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
    if (user is null) return Results.Unauthorized();

    if (!PasswordHasher.Verify(req.Password, user.PasswordHash, user.PasswordSalt))
        return Results.Unauthorized();

    var token = jwtSvc.CreateToken(user);
    return Results.Ok(new AuthResponse(token));
});

app.MapPost("/api/auth/forgot-password", async (ForgotPasswordRequest req, AppDbContext db) =>
{
    var email = (req.Email ?? "").Trim().ToLowerInvariant();

    const string okMsg = "If that email exists, you'll receive password reset instructions.";

    if (string.IsNullOrWhiteSpace(email))
        return Results.Ok(new ForgotPasswordResponse(okMsg, null));

    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
    if (user is null)
        return Results.Ok(new ForgotPasswordResponse(okMsg, null));

    var now = DateTime.UtcNow;

    // mark existing active tokens as used (optional but clean)
    var old = await db.PasswordResetTokens
        .Where(t => t.UserId == user.Id && t.UsedAtUtc == null && t.ExpiresAtUtc > now)
        .ToListAsync();

    foreach (var t in old) t.UsedAtUtc = now;

    var rawToken = ResetToken.GenerateRawToken();
    var tokenHash = ResetToken.HashToken(rawToken);

    db.PasswordResetTokens.Add(new PasswordResetTokenEntity
    {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        TokenHash = tokenHash,
        ExpiresAtUtc = now.AddMinutes(30),
        UsedAtUtc = null
    });

    await db.SaveChangesAsync();

    var devToken = app.Environment.IsDevelopment() ? rawToken : null;
    return Results.Ok(new ForgotPasswordResponse(okMsg, devToken));
});

app.MapPost("/api/auth/reset-password", async (ResetPasswordRequest req, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(req.Token) || string.IsNullOrWhiteSpace(req.NewPassword))
        return Results.BadRequest("Token and new password are required.");

    if (req.NewPassword.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters.");

    var now = DateTime.UtcNow;
    var tokenHash = ResetToken.HashToken(req.Token);

    var reset = await db.PasswordResetTokens
        .Include(t => t.User)
        .FirstOrDefaultAsync(t =>
            t.UsedAtUtc == null &&
            t.ExpiresAtUtc > now &&
            t.TokenHash == tokenHash);

    if (reset is null || reset.User is null)
        return Results.BadRequest("Invalid or expired token.");

    PasswordHasher.CreateHash(req.NewPassword, out var hash, out var salt);
    reset.User.PasswordHash = hash;
    reset.User.PasswordSalt = salt;

    reset.UsedAtUtc = now;

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Password reset successful. Please log in." });
});

tasksGroup.MapPut("{id:guid}", async (Guid id, UpdateTaskRequest req, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);

    var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    if (entity is null) return Results.NotFound();

    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest("Title is required.");

    entity.Title = req.Title.Trim();
    entity.IsDone = req.IsDone;

    await db.SaveChangesAsync();
    return Results.Ok(new TaskItem(entity.Id, entity.Title, entity.IsDone));
});

tasksGroup.MapDelete("{id:guid}", async (Guid id, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);

    var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    if (entity is null) return Results.NotFound();

    db.Tasks.Remove(entity);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// static Guid GetUserId(ClaimsPrincipal user)
// {
//     var sub = user.FindFirstValue("sub");
//     if (string.IsNullOrWhiteSpace(sub))
//         throw new Exception("Missing sub claim in JWT");
//     return Guid.Parse(sub);
// }
static Guid GetUserId(ClaimsPrincipal user)
{
    var id =
        user.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
        user.FindFirstValue("sub") ??
        user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrWhiteSpace(id))
        throw new Exception("Missing sub claim in JWT");

    return Guid.Parse(id);
}

app.Run();

record AuthRequest(string Email, string Password);
record AuthResponse(string Token);
record ForgotPasswordRequest(string Email);
record ForgotPasswordResponse(string Message, string? DevResetToken);
record ResetPasswordRequest(string Token, string NewPassword);

