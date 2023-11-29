package com.github.senocak.util.validation

import jakarta.validation.Constraint
import kotlin.reflect.KClass
import com.github.senocak.domain.dto.UpdateUserDto
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext

@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [PasswordMatchesValidator::class])
annotation class PasswordMatches(
    val message: String = "Passwords don''t match",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Any>> = []
)

class PasswordMatchesValidator : ConstraintValidator<PasswordMatches, Any> {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    override fun initialize(passwordMatches: PasswordMatches) {
        log.info("PasswordMatchesValidator initialized")
    }

    override fun isValid(obj: Any, context: ConstraintValidatorContext): Boolean =
        when (obj.javaClass) {
            UpdateUserDto::class.java -> {
                val (_: String?, password: String?, passwordConfirmation: String?) = obj as UpdateUserDto
                password == passwordConfirmation
            }
            else -> false
        }
}