# CSV Import Examples

## Clubs Import

Create a file `clubs.csv`:

```csv
external_club_id,name,city,timezone,brand
CLUB001,Downtown Fitness,Paris,Europe/Paris,MyBrand
CLUB002,Westside Gym,Lyon,Europe/Paris,MyBrand
CLUB003,Northside Club,Marseille,Europe/Paris,MyBrand
```

**Import via API:**

```bash
curl -X POST http://localhost:3000/api/v1/clubs/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@clubs.csv"
```

## Members Import

Create a file `members.csv`:

```csv
external_member_id,external_club_id,first_name,last_name,email
MEM001,CLUB001,Jean,Dupont,jean.dupont@example.com
MEM002,CLUB001,Marie,Martin,marie.martin@example.com
MEM003,CLUB002,Pierre,Durand,pierre.durand@example.com
```

**Import via API:**

```bash
curl -X POST http://localhost:3000/api/v1/members/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@members.csv"
```

## Notes

- Les `external_*_id` sont vos identifiants internes
- Le timezone doit être un timezone IANA valide (ex: Europe/Paris, America/New_York)
- L'email est optionnel pour les membres
- Le brand est optionnel pour les clubs (si multi-marques)

## Validation

Après import, vérifier:

```sql
-- Nombre de clubs importés
SELECT COUNT(*) FROM clubs;

-- Nombre de membres importés
SELECT COUNT(*) FROM members;

-- Vérifier les clubs sans timezone
SELECT * FROM clubs WHERE timezone IS NULL;
```

## Formats de date acceptés

Pour les imports avec dates (seasons, etc.):
- ISO 8601: `2024-12-16T10:00:00Z`
- Simple: `2024-12-16`
- Avec timezone: `2024-12-16 10:00:00+01:00`
