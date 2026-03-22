# Admin Usage

Public site:
- `GET /api/players`

Owner-only routes:
- `POST /api/admin/players`
- `DELETE /api/admin/players/:id`

Owner admin page:
- `http://localhost:5173/admin`

Images:
- File uploads are stored in Cloudinary
- The backend saves the returned hosted image URL in the player record

Required header:

```http
x-admin-key: YOUR_ADMIN_API_KEY
```

Example create with image upload:

```bash
curl -X POST http://localhost:4000/api/admin/players ^
  -H "x-admin-key: YOUR_ADMIN_API_KEY" ^
  -F "name=Alex" ^
  -F "position=Midfielder" ^
  -F "skillLevel=Pro" ^
  -F "photo=@C:\path\to\player.png"
```

Example delete:

```bash
curl -X DELETE http://localhost:4000/api/admin/players/PLAYER_ID ^
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```
