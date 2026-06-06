using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetaHuman.Backend.Controllers;

[Route("api/pacient")]
[ApiController]
[Authorize(Policy = "Pacient")]
public class PacientController : ControllerBase
{
    private readonly PacientService _pacientService;
    private readonly AlertService _alertService;
    private readonly RecomandareService _recomandareService;

    public PacientController(
        PacientService pacientService,
        AlertService alertService,
        RecomandareService recomandareService)
    {
        _pacientService = pacientService;
        _alertService = alertService;
        _recomandareService = recomandareService;
    }

    [HttpGet("profil")]
    public async Task<ActionResult<RaspunsPacientDetaliuDTO>> ObtineProfil(
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _pacientService.ObtineProfilCurentAsync(cancellationToken));
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("alerte")]
    public async Task<ActionResult<IReadOnlyList<RaspunsAlertaDTO>>> ObtineAlerte(
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _alertService.ObtinePentruPacientCurentAsync(cancellationToken));
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("recomandari")]
    public async Task<ActionResult<IReadOnlyList<RaspunsRecomandareDTO>>> ObtineRecomandari(
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _recomandareService.ObtinePentruPacientCurentAsync(cancellationToken));
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }
}
