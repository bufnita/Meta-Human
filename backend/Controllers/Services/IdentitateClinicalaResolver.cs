using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

/// <summary>Rezolvă IdMedic / IdPacient din utilizatorul JWT — evită duplicarea în fiecare service.</summary>
public class IdentitateClinicalaResolver
{
    private readonly MetaHumanContext _context;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;

    public IdentitateClinicalaResolver(
        MetaHumanContext context,
        IUtilizatorCurentAccessor utilizatorCurent)
    {
        _context = context;
        _utilizatorCurent = utilizatorCurent;
    }

    public async Task<int?> ObtineIdMedicCurentAsync(CancellationToken cancellationToken = default)
    {
        if (!_utilizatorCurent.IdUtilizator.HasValue)
            return null;

        return await _context.Medici
            .Where(m => m.IdUtilizator == _utilizatorCurent.IdUtilizator.Value)
            .Select(m => (int?)m.IdMedic)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int?> ObtineIdPacientCurentAsync(CancellationToken cancellationToken = default)
    {
        if (!_utilizatorCurent.IdUtilizator.HasValue)
            return null;

        return await _context.Pacienti
            .Where(p => p.IdUtilizator == _utilizatorCurent.IdUtilizator.Value)
            .Select(p => (int?)p.IdPacient)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
