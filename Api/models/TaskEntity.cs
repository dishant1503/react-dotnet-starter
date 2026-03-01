namespace Api.Models;

public class TaskEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
    public Guid UserId { get; set; }
    public UserEntity? User { get; set; }
}