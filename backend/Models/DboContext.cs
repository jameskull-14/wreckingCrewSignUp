using Microsoft.EntityFrameworkCore;

public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<Song> Songs { get; set; }
}

public class Song
{
    public int Id { get; set; }
    public string SongName { get; set; }
    public string Artist { get; set; }
}
