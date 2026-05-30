using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;
using MetaHuman.Backend.Models;
using MetaHuman.Backend.DTOs;

namespace MetaHuman.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Medic")]
    public class PacientiController : ControllerBase
    {
        private readonly MetaHumanContext _context;

        public PacientiController(MetaHumanContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AdaugaPacient([FromBody] PacientDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pacient = new Pacient
            {
                IdMedic = dto.IdMedic,
                Nume = dto.Nume,
                Prenume = dto.Prenume,
                Varsta = dto.Varsta,
                Cnp = dto.Cnp,
                Telefon = dto.Telefon,
                Email = dto.Email,
                Activ = true 
            };

            try
            {
                _context.Pacienti.Add(pacient);
                await _context.SaveChangesAsync();

                return Created(string.Empty, new { mesaj = "Pacient adăugat cu succes.", idPacient = pacient.IdPacient });
            }
            catch (Exception)
            {
                return StatusCode(500, "A apărut o eroare internă la salvarea pacientului.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPacienti()
        {
            var pacienti = await _context.Pacienti
                .Select(p => new {
                    p.IdPacient,
                    p.Nume,
                    p.Prenume,
                    p.Varsta,
                    p.Email
                })
                .ToListAsync();

            return Ok(pacienti);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPacientDetalii(int id)
        {
            var pacient = await _context.Pacienti
                .Include(p => p.Masuratori)
                .Include(p => p.Alerte)
                .FirstOrDefaultAsync(p => p.IdPacient == id);

            if (pacient == null)
            {
                return NotFound(new { mesaj = "Pacientul căutat nu a fost găsit în baza de date." });
            }

            return Ok(pacient);
        }
    }
}