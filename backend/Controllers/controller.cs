using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly MyDbContext _context;

    public SongsController(MyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await _context.Songs.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Post(Song song)
    {
        _context.Songs.Add(song);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = song.Id }, song);
    }
}
