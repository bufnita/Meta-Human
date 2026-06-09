using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetaHuman.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Admin")]
public class MediciController : ControllerBase
{
    private readonly MedicService _medicService;

    public MediciController(MedicService medicService)
    {
        _medicService = medicService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RaspunsMedicDTO>>> ObtineToti(
        CancellationToken cancellationToken)
    {
        return Ok(await _medicService.ObtineTotiAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RaspunsMedicDTO>> ObtineDupaId(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _medicService.ObtineDupaIdAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Medicul nu a fost găsit." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RaspunsMedicDTO>> Creeaza(
        [FromBody] CerereMedicDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            var medic = await _medicService.CreeazaAsync(cerere, cancellationToken);
            return Created($"/api/medici/{medic.IdMedic}", medic);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RaspunsMedicDTO>> Actualizeaza(
        int id,
        [FromBody] CerereActualizareMedicDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _medicService.ActualizeazaAsync(id, cerere, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Medicul nu a fost găsit." });
        }
    }

    [HttpPatch("{id:int}/dezactivare")]
    public async Task<IActionResult> Dezactiveaza(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _medicService.DezactiveazaAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Medicul nu a fost găsit." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpPatch("{id:int}/activare")]
    public async Task<IActionResult> Activeaza(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _medicService.ActiveazaAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Medicul nu a fost găsit." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Sterge(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _medicService.StergeDefinitivAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Medicul nu a fost găsit." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }
}
