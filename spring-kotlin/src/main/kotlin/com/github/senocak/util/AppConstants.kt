package com.github.senocak.util

import ch.qos.logback.classic.Level
import com.github.senocak.domain.dto.WebsocketIdentifier
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.text.Normalizer
import java.util.regex.Pattern
import kotlin.reflect.KClass
import kotlin.reflect.full.companionObject

object AppConstants {
    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    val corePoolSize: Int = Runtime.getRuntime().availableProcessors()
    const val DEFAULT_PAGE_NUMBER = "0"
    const val DEFAULT_PAGE_SIZE = "10"
    const val MAIL_REGEX = "^\\S+@\\S+\\.\\S+$"
    const val TOKEN_HEADER_NAME = "Authorization"
    const val TOKEN_PREFIX = "Bearer "
    const val ADMIN = "ADMIN"
    const val USER = "USER"
    const val securitySchemeName = "bearerAuth"

    /**
     * @param input -- string variable to make it sluggable
     * @return -- sluggable string variable
     */
    fun toSlug(input: String): String {
        val nonLatin: Pattern = Pattern.compile("[^\\w-]")
        val whiteSpace: Pattern = Pattern.compile("[\\s]")
        val noWhiteSpace: String = whiteSpace.matcher(input).replaceAll("-")
        val normalized: String = Normalizer.normalize(noWhiteSpace, Normalizer.Form.NFD)
        return nonLatin.matcher(normalized).replaceAll("")
    }

    /**
     * Logging
     * https://stackoverflow.com/questions/34416869/idiomatic-way-of-logging-in-kotlin
     */
    // Return logger for Java class, if companion object fix the name
    fun <T: Any> logger(forClass: Class<T>): Logger = LoggerFactory.getLogger(unwrapCompanionClass(forClass).name)

    // unwrap companion class to enclosing class given a Java Class
    fun <T : Any> unwrapCompanionClass(ofClass: Class<T>): Class<*> {
        return ofClass.enclosingClass?.takeIf {
            ofClass.enclosingClass.kotlin.companionObject?.java == ofClass
        } ?: ofClass
    }

    // unwrap companion class to enclosing class given a Kotlin Class
    fun <T: Any> unwrapCompanionClass(ofClass: KClass<T>): KClass<*> {
        return unwrapCompanionClass(ofClass.java).kotlin
    }

    // Return logger for Kotlin class
    fun <T: Any> logger(forClass: KClass<T>): Logger {
        return logger(forClass.java)
    }

    // return logger from extended class (or the enclosing class)
    fun <T: Any> T.logger(): Logger {
        return logger(this.javaClass)
    }

    // return a lazy logger property delegate for enclosing class
    fun <R : Any> R.lazyLogger(): Lazy<Logger> {
        return lazy { logger(this.javaClass) }
    }

    // return a logger property delegate for enclosing class
    fun <R : Any> R.injectLogger(): Lazy<Logger> {
        return lazyOf(logger(this.javaClass))
    }

    // marker interface and related extension (remove extension for Any.logger() in favour of this)
    interface Loggable {}
    fun Loggable.logger(): Logger = logger(this.javaClass)

    // abstract base class to provide logging, intended for companion objects more than classes but works for either
    abstract class WithLogging: Loggable {
        val LOG = logger()
    }
    /** Logging */
}