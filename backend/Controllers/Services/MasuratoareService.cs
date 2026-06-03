using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class MasuratoareService
{
    private readonly MetaHumanContext _context;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;
    private readonly IdentitateClinicalaResolver _identitateClinicala;
    private readonly AlertService _alertService;

    public MasuratoareService(
        MetaHumanContext context,
        IUtilizatorCurentAccessor utilizatorCurent,
        IdentitateClinicalaResolver identitateClinicala,
        AlertService alertService)
    {
        _context = context;
        _utilizatorCurent = utilizatorCurent;
        _identitateClinicala = identitateClinicala;
        _alertService = alertService;
    }

    public async Task<RaspunsMasuratoareDTO> SalveazaAsync(
        CerereMasuratoareDTO cerere,
        CancellationToken cancellationToken = default)
    {
        await VerificaPacientAutentificatAsync(cerere.IdPacient, cancellationToken);

        var masuratoare = new Masuratoare
        {
            IdPacient = cerere.IdPacient,
            TipParametru = cerere.TipParametru.Trim(),
            Valoare = cerere.Valoare,
            UnitateMasura = cerere.Unitate.Trim(),
            DataOra = cerere.DataOra,
            Sursa = cerere.Sursa.Trim(),
            Observatii = cerere.Observatii?.Trim(),
            Stare = "Prelucrat"
        };

        _context.Masuratori.Add(masuratoare);
        await _context.SaveChangesAsync(cancellationToken);

        await _alertService.EvalueazaDupaMasuratoareAsync(masuratoare, cancellationToken);

        return MapLaRaspuns(masuratoare);
    }

    public async Task<RaspunsIstoricMasuratoriDTO> ObtineIstoricAsync(
        int idPacient,
        int ultimele,
        CancellationToken cancellationToken = default)
    {
        if (ultimele <= 0)
            ultimele = 100;

        var masuratori = await _context.Masuratori
            .Where(m => m.IdPacient == idPacient)
            .OrderByDescending(m => m.DataOra)
            .Take(ultimele)
            .ToListAsync(cancellationToken);

        return new RaspunsIstoricMasuratoriDTO
        {
            IdPacient = idPacient,
            Masuratori = masuratori.Select(MapLaRaspuns).ToList()
        };
    }

    public async Task<RaspunsIstoricMasuratoriDTO> ObtineIstoricPentruPacientCurentAsync(
        int ultimele,
        CancellationToken cancellationToken = default)
    {
        var idPacient = await _identitateClinicala.ObtineIdPacientCurentAsync(cancellationToken);
        if (!idPacient.HasValue)
            throw new AccesInterzisException("Profilul de pacient nu a fost găsit.");

        return await ObtineIstoricAsync(idPacient.Value, ultimele, cancellationToken);
    }

    private async Task VerificaPacientAutentificatAsync(
        int idPacientDinCerere,
        CancellationToken cancellationToken)
    {
        if (!_utilizatorCurent.EstePacient)
            throw new AccesInterzisException("Doar pacienții pot trimite măsurători.");

        var idPacient = await _identitateClinicala.ObtineIdPacientCurentAsync(cancellationToken);
        if (!idPacient.HasValue || idPacient.Value != idPacientDinCerere)
            throw new AccesInterzisException("Nu puteți trimite măsurători pentru alt pacient.");
    }

    private static RaspunsMasuratoareDTO MapLaRaspuns(Masuratoare m) => new()
    {
        IdMasuratoare = m.IdMasuratoare,
        IdPacient = m.IdPacient,
        TipParametru = m.TipParametru,
        Valoare = m.Valoare,
        UnitateMasura = m.UnitateMasura,
        DataOra = m.DataOra,
        Stare = m.Stare
    };
}
