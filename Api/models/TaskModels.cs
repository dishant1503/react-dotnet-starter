namespace Api.Models;

public record TaskItem(Guid Id, string Title, bool IsDone);

public record CreateTaskRequest(string Title);

public record UpdateTaskRequest(string Title, bool IsDone);
