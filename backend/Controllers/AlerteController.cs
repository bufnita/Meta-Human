using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetaHuman.Backend.Controllers;

[Route("api/alerte")]
[ApiController]
[Authorize(Policy = "Medic")]
public class AlerteController : ControllerBase
{
    private readonly AlertService _alertService;

    public AlerteController(AlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RaspunsAlertaDTO>>> ObtineToate(
        CancellationToken cancellationToken)
    {
        return Ok(await _alertService.ObtinePentruMedicCurentAsync(cancellationToken));
    }

    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<RaspunsAlertaDTO>>> ObtineActive(
        CancellationToken cancellationToken)
    {
        return Ok(await _alertService.ObtineActivePentruMedicCurentAsync(cancellationToken));
    }

    [HttpPut("{id:int}/rezolva")]
    public async Task<ActionResult<RaspunsAlertaDTO>> Rezolva(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _alertService.RezolvaAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Alerta nu a fost găsită." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPut("{id:int}/ignora")]
    public async Task<ActionResult<RaspunsAlertaDTO>> Ignora(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _alertService.IgnoraAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Alerta nu a fost găsită." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }
}
