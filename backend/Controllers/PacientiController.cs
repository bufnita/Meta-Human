using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetaHuman.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "MedicOrAdmin")]
public class PacientiController : ControllerBase
{
    private readonly PacientService _pacientService;
    private readonly MasuratoareService _masuratoareService;
    private readonly AlertService _alertService;
    private readonly PragAlertaService _pragAlertaService;
    private readonly RecomandareService _recomandareService;

    public PacientiController(
        PacientService pacientService,
        MasuratoareService masuratoareService,
        AlertService alertService,
        PragAlertaService pragAlertaService,
        RecomandareService recomandareService)
    {
        _pacientService = pacientService;
        _masuratoareService = masuratoareService;
        _alertService = alertService;
        _pragAlertaService = pragAlertaService;
        _recomandareService = recomandareService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RaspunsPacientDTO>>> ObtineLista(
        CancellationToken cancellationToken)
    {
        return Ok(await _pacientService.ObtineListaAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RaspunsPacientDetaliuDTO>> ObtineDetaliu(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _pacientService.ObtineDetaliuAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RaspunsPacientDTO>> Creeaza(
        [FromBody] CererePacientDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            var pacient = await _pacientService.CreeazaAsync(cerere, cancellationToken);
            return Created($"/api/pacienti/{pacient.IdPacient}", pacient);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RaspunsPacientDTO>> Actualizeaza(
        int id,
        [FromBody] CererePacientDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _pacientService.ActualizeazaAsync(id, cerere, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpPatch("{id:int}/dezactivare")]
    public async Task<IActionResult> Dezactiveaza(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _pacientService.DezactiveazaAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPatch("{id:int}/activare")]
    public async Task<IActionResult> Activeaza(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _pacientService.ActiveazaAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Sterge(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _pacientService.StergeDefinitivAsync(id, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("{id:int}/istoric")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<RaspunsIstoricMasuratoriDTO>> ObtineIstoric(
        int id,
        [FromQuery] int ultimele = 100,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _pacientService.VerificaAccesMedicLaPacientAsync(id, cancellationToken);
            return Ok(await _masuratoareService.ObtineIstoricAsync(id, ultimele, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("{id:int}/alarme")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<RaspunsAlertaDTO>>> ObtineAlarme(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _pacientService.VerificaAccesMedicLaPacientAsync(id, cancellationToken);
            return Ok(await _alertService.ObtinePentruPacientAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("{id:int}/praguri")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<RaspunsPragAlertaDTO>>> ObtinePraguri(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _pragAlertaService.ObtinePentruPacientAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPost("{id:int}/praguri")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<RaspunsPragAlertaDTO>> ConfigureazaPrag(
        int id,
        [FromBody] CererePragAlertaDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            var prag = await _pragAlertaService.ConfigureazaAsync(id, cerere, cancellationToken);
            return Created($"/api/pacienti/{id}/praguri", prag);
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpPut("{id:int}/praguri/{idPrag:int}")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<RaspunsPragAlertaDTO>> ActualizeazaPrag(
        int id,
        int idPrag,
        [FromBody] CererePragAlertaDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _pragAlertaService.ActualizeazaAsync(id, idPrag, cerere, cancellationToken));
        }
        catch (ResursaNegasitaException ex)
        {
            return NotFound(new { mesaj = ex.Message });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpDelete("{id:int}/praguri/{idPrag:int}")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<IActionResult> StergePrag(
        int id,
        int idPrag,
        CancellationToken cancellationToken)
    {
        try
        {
            await _pragAlertaService.StergeAsync(id, idPrag, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException ex)
        {
            return NotFound(new { mesaj = ex.Message });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpGet("{id:int}/recomandari")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<RaspunsRecomandareDTO>>> ObtineRecomandari(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _recomandareService.ObtinePentruPacientAsync(id, cancellationToken));
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }

    [HttpPost("{id:int}/recomandari")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<RaspunsRecomandareDTO>> AdaugaRecomandare(
        int id,
        [FromBody] CerereRecomandareDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            var recomandare = await _recomandareService.CreeazaAsync(id, cerere, cancellationToken);
            return Created($"/api/pacienti/{id}/recomandari", recomandare);
        }
        catch (ResursaNegasitaException)
        {
            return NotFound(new { mesaj = "Pacientul nu a fost găsit." });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpPut("{id:int}/recomandari/{idRecomandare:int}")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<ActionResult<RaspunsRecomandareDTO>> ActualizeazaRecomandare(
        int id,
        int idRecomandare,
        [FromBody] CerereRecomandareDTO cerere,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _recomandareService.ActualizeazaAsync(
                id,
                idRecomandare,
                cerere,
                cancellationToken));
        }
        catch (ResursaNegasitaException ex)
        {
            return NotFound(new { mesaj = ex.Message });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mesaj = ex.Message });
        }
    }

    [HttpDelete("{id:int}/recomandari/{idRecomandare:int}")]
    [Authorize(Policy = "MedicOrAdmin")]
    public async Task<IActionResult> StergeRecomandare(
        int id,
        int idRecomandare,
        CancellationToken cancellationToken)
    {
        try
        {
            await _recomandareService.StergeAsync(id, idRecomandare, cancellationToken);
            return NoContent();
        }
        catch (ResursaNegasitaException ex)
        {
            return NotFound(new { mesaj = ex.Message });
        }
        catch (AccesInterzisException ex)
        {
            return StatusCode(403, new { mesaj = ex.Message });
        }
    }
}
