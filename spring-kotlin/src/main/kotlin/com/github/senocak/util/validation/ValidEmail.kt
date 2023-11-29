package com.github.senocak.util.validation

import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import kotlin.reflect.KClass
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.regex.Matcher
import java.util.regex.Pattern

@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [EmailValidator::class])
annotation class ValidEmail (
    val message: String = "Invalid email",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Any>> = []
)

class EmailValidator : ConstraintValidator<ValidEmail?, String?> {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    override fun initialize(constraintAnnotation: ValidEmail?): Unit = log.info("EmailValidator initialized")

    override fun isValid(email: String?, context: ConstraintValidatorContext): Boolean =
        when (email) {
            null -> false
            else -> {
                val pattern: Pattern = Pattern.compile(
                    "^[_A-Za-z0-9-+]" +
                            "(.[_A-Za-z0-9-]+)*@" + "[A-Za-z0-9-]+(.[A-Za-z0-9]+)*" + "(.[A-Za-z]{2,})$"
                )
                pattern.matcher(email).matches()
            }
        }
}