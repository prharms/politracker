---
name: promote-route-to-login
description: Move a Flask route from admin-only to accessible by all logged-in users. Use when demoting an @admin_required route to @login_required, including renaming files, moving templates, updating the blueprint, updating navigation, and adding a homepage card.
---

# Promote Route from Admin-Only to Login-Required

## Context

This project uses two auth decorators:
- `@login_required` — any authenticated user
- `@admin_required` — admin users only (always stacked after `@login_required`)

Admin routes live in `legiscan_loader/presentation/web/routes/` and use the URL prefix `/admin/...`.
Login-required (public) routes live in `legiscan_loader/presentation/web/blueprints/` and use clean URL prefixes (e.g. `/ca-...`).
Templates for admin routes live in `templates/admin/`.
Templates for California public routes live in `templates/california/`.
Navigation and homepage cards are maintained in `base.html` and `routes/index.py`.

## Steps

### 1. Rename files with git mv (never delete and recreate)

```powershell
git mv legiscan_loader/presentation/web/routes/admin_THING.py legiscan_loader/presentation/web/blueprints/ca_THING.py
git mv legiscan_loader/presentation/web/templates/admin/THING_form.html legiscan_loader/presentation/web/templates/california/ca_THING_form.html
git mv legiscan_loader/presentation/web/templates/admin/THING_view.html legiscan_loader/presentation/web/templates/california/ca_THING_view.html
```

### 2. Update the blueprint file

In the renamed blueprint file:
- Remove `admin_required` from the import
- Rename the blueprint variable: `admin_THING_bp` → `ca_THING_bp`
- Change `url_prefix` from `/admin/THING` to `/ca-THING`
- Remove `@admin_required` from both route handlers
- Update both `render_template(...)` calls to point to `california/ca_THING_*.html`
- Update the module docstring to remove "Admin only" language

### 3. Update templates

In both moved templates:
- Replace all `url_for('admin_THING.*')` with `url_for('ca_THING.*')`
- Remove any "Admin Only" labels from info boxes or titles

### 4. Update app.py

Replace the old import and registration:
```python
# Before
from .routes.admin_THING import admin_THING_bp
app.register_blueprint(admin_THING_bp)

# After
from .blueprints.ca_THING import ca_THING_bp
app.register_blueprint(ca_THING_bp)
```

### 5. Update base.html navigation

Three changes in `templates/base.html`:

a) **Remove** the admin menu entry (inside `{% if current_user.can_manage_users() %}`):
```html
<!-- Remove this -->
<li><a class="dropdown-item" href="{{ url_for('admin_THING.index') }}">
    <i class="bi bi-ICON me-2"></i>Admin: THING
</a></li>
```

b) **Add** to the appropriate dropdown(s) (Legislators and/or Interest Groups), after the nearest related item:
```html
<li>
    <a class="dropdown-item" href="{{ url_for('ca_THING.index') }}">
        THING Label
    </a>
</li>
```

c) **Add** to the All Tools offcanvas sidebar, after the nearest related item:
```html
<li class="mb-2">
    <a href="{{ url_for('ca_THING.index') }}" class="text-decoration-none">
        THING Label
    </a>
</li>
```

### 6. Add homepage card in index.py

Add to the `all_tools` list in `routes/index.py`, adjacent to related tools:
```python
{
    "id": "ca-THING",
    "name": "THING Display Name",
    "description": "One sentence description for the homepage card.",
    "icon": "BOOTSTRAP-ICON-NAME",
    "url": url_for("ca_THING.index"),
    "status": "active",
    "categories": ["legislators", "interest_groups"],  # adjust as appropriate
},
```

### 7. Verify no stale references

```powershell
# Should return no matches
rg "admin_THING" legiscan_loader/
```

## Checklist

- [ ] `git mv` used (never delete + recreate)
- [ ] Blueprint variable and name updated in `.py` file
- [ ] `url_prefix` changed to `/ca-...`
- [ ] `@admin_required` removed from both route handlers
- [ ] `admin_required` removed from import
- [ ] `render_template` paths updated to `california/ca_...`
- [ ] All `url_for('admin_THING.*')` references updated in templates
- [ ] `app.py` import and registration updated
- [ ] Admin menu entry removed from `base.html`
- [ ] Nav dropdowns updated in `base.html`
- [ ] All Tools offcanvas updated in `base.html`
- [ ] Homepage card added in `index.py`
- [ ] No remaining references to old blueprint name
- [ ] Lint passes (`./make.ps1 lint`)
