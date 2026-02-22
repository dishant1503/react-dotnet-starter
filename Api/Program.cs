using Api.Models;

var builder = WebApplication.CreateBuilder(args);

var tasks = new List<TaskItem>();

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
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("dev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapGet("/api/tasks", () => tasks);

app.MapPost("/api/tasks", (CreateTaskRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest("Title is required.");

    var task = new TaskItem(Guid.NewGuid(), req.Title.Trim(), false);
    tasks.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapPut("/api/tasks/{id:guid}", (Guid id, UpdateTaskRequest req) =>
{
    var idx = tasks.FindIndex(t => t.Id == id);
    if (idx == -1) return Results.NotFound();

    if (string.IsNullOrWhiteSpace(req.Title))
        return Results.BadRequest("Title is required.");

    var updated = new TaskItem(id, req.Title.Trim(), req.IsDone);
    tasks[idx] = updated;
    return Results.Ok(updated);
});

app.MapDelete("/api/tasks/{id:guid}", (Guid id) =>
{
    var idx = tasks.FindIndex(t => t.Id == id);
    if (idx == -1) return Results.NotFound();

    tasks.RemoveAt(idx);
    return Results.NoContent();
});


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
