package com.github.senocak.security

@Target(
    AnnotationTarget.ANNOTATION_CLASS,
    AnnotationTarget.CLASS,
    AnnotationTarget.FUNCTION
)
@kotlin.annotation.Retention(AnnotationRetention.RUNTIME)
annotation class Authorize(val roles: Array<String>)