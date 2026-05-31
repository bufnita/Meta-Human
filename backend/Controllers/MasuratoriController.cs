using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetaHuman.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "Pacient")]
public class MasuratoriController : ControllerBase
{
    private readonly MasuratoareService _masuratoareService;
    private readonly EcgService _ecgService;

    public MasuratoriController(
        MasuratoareService masuratoareService,
        EcgService ecgService)
    {
        _masuratoareService = masuratoareService;
        _ecgService = ecgService;
    }

    [HttpPost]
    public async Task<ActionResult<RaspunsMasuratoareDTO>> PreluareMasuratoare(
        [FromBody] CerereMasuratoareDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var masuratoare = await _masuratoareService.SalveazaAsync(dto, cancellationToken);
            return Created(string.Empty, masuratoare);
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPost("ecg")]
    public async Task<ActionResult<RaspunsEcgDTO>> PreluareEcg(
        [FromBody] CerereEcgDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var ecg = await _ecgService.SalveazaAsync(dto, cancellationToken);
            return Created(string.Empty, ecg);
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("istoric")]
    public async Task<ActionResult<RaspunsIstoricMasuratoriDTO>> ObtineIstoricPropriu(
        [FromQuery] int ultimele = 100,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _masuratoareService.ObtineIstoricPentruPacientCurentAsync(
                ultimele,
                cancellationToken));
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }
}
