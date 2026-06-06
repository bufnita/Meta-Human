using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class RecomandareService
{
    private readonly MetaHumanContext _context;
    private readonly IdentitateClinicalaResolver _identitateClinicala;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;

    public RecomandareService(
        MetaHumanContext context,
        IdentitateClinicalaResolver identitateClinicala,
        IUtilizatorCurentAccessor utilizatorCurent)
    {
        _context = context;
        _identitateClinicala = identitateClinicala;
        _utilizatorCurent = utilizatorCurent;
    }

    public async Task<RaspunsRecomandareDTO> CreeazaAsync(
        int idPacient,
        CerereRecomandareDTO cerere,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuAccesAsync(idPacient, cancellationToken);
        var idMedic = _utilizatorCurent.EsteAdmin
            ? pacient.IdMedic
            : await ObtineIdMedicCurentAsync(cancellationToken);

        var recomandare = new Recomandare
        {
            IdPacient = idPacient,
            IdMedic = idMedic,
            TipActivitate = cerere.TipActivitate.Trim(),
            DurataZilnica = cerere.DurataZilnica?.Trim(),
            AlteIndicatii = cerere.AlteIndicatii?.Trim(),
            DataInceput = cerere.DataInceput,
            DataSfarsit = cerere.DataSfarsit,
            Stare = "Activă"
        };

        _context.Recomandari.Add(recomandare);
        await _context.SaveChangesAsync(cancellationToken);

        return MapLaRaspuns(recomandare);
    }

    public async Task<IReadOnlyList<RaspunsRecomandareDTO>> ObtinePentruPacientAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuAccesAsync(idPacient, cancellationToken);

        var recomandari = await _context.Recomandari
            .Where(r => r.IdPacient == idPacient)
            .OrderByDescending(r => r.DataInceput)
            .ToListAsync(cancellationToken);

        return recomandari.Select(MapLaRaspuns).ToList();
    }

    public async Task<IReadOnlyList<RaspunsRecomandareDTO>> ObtinePentruPacientCurentAsync(
        CancellationToken cancellationToken = default)
    {
        var idPacient = await _identitateClinicala.ObtineIdPacientCurentAsync(cancellationToken);
        if (!idPacient.HasValue)
            throw new AccesInterzisException("Profilul de pacient nu a fost gasit.");

        var recomandari = await _context.Recomandari
            .Where(r => r.IdPacient == idPacient.Value)
            .OrderByDescending(r => r.DataInceput)
            .ToListAsync(cancellationToken);

        return recomandari.Select(MapLaRaspuns).ToList();
    }

    private async Task<Pacient> ObtinePacientCuAccesAsync(
        int idPacient,
        CancellationToken cancellationToken)
    {
        var pacient = await _context.Pacienti
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPacient == idPacient, cancellationToken);

        if (pacient == null)
            throw new ResursaNegasitaException("Pacientul nu a fost găsit.");

        if (_utilizatorCurent.EsteAdmin)
            return pacient;

        var idMedic = await ObtineIdMedicCurentAsync(cancellationToken);
        if (pacient.IdMedic != idMedic)
            throw new AccesInterzisException("Nu aveți acces la acest pacient.");

        return pacient;
    }

    private async Task<int> ObtineIdMedicCurentAsync(CancellationToken cancellationToken)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            throw new AccesInterzisException("Profilul de medic nu a fost găsit.");

        return idMedic.Value;
    }

    private static RaspunsRecomandareDTO MapLaRaspuns(Recomandare r) => new()
    {
        IdRecomandare = r.IdRecomandare,
        IdPacient = r.IdPacient,
        TipActivitate = r.TipActivitate,
        DurataZilnica = r.DurataZilnica,
        AlteIndicatii = r.AlteIndicatii,
        DataInceput = r.DataInceput,
        DataSfarsit = r.DataSfarsit,
        Stare = r.Stare
    };
}
