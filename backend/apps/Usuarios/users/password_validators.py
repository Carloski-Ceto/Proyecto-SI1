import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class AlphanumericComplexityValidator:
    """Valida contraseñas con complejidad: mayúscula, minúscula, número y símbolo especial."""

    def validate(self, password, user=None):
        if not re.search(r"[A-Z]", password):
            raise ValidationError(
                _("La contraseña debe incluir al menos una letra mayúscula."),
                code="password_no_upper",
            )

        if not re.search(r"[a-z]", password):
            raise ValidationError(
                _("La contraseña debe incluir al menos una letra minúscula."),
                code="password_no_lower",
            )

        if not re.search(r"[0-9]", password):
            raise ValidationError(
                _("La contraseña debe incluir al menos un número."),
                code="password_no_digit",
            )

        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?`~]", password):
            raise ValidationError(
                _("La contraseña debe incluir al menos un símbolo especial (ej: !, @, #, $)."),
                code="password_no_symbol",
            )

    def get_help_text(self):
        return _(
            "Tu contraseña debe tener al menos 8 caracteres e incluir: una mayúscula, una minúscula, un número y un símbolo especial (ej: !, @, #, $)."
        )
