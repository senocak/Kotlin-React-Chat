package com.github.senocak

import java.time.Duration

object TestConstants {
    val CONTAINER_WAIT_TIMEOUT: Duration = Duration.ofMinutes(2)
    const val USER_NAME = "anil senocak"
    const val USER_EMAIL = "anil1@senocak.com"
    const val USER_PASSWORD = "asenocak"
    const val JWT_TOKEN_BLACK_LISTED =
        "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhc2Vub2Nha0FkbWluIiwicm9sZXMiOlsiQURNSU4iXSwidHlwZSI6Imp3dCIsImV4cCI6MTY1MzY0MzE2NywiaWF0IjoxNjUzNjQyODY3fQ.bxeIA_BjlsQQDIK35KY6Qdrm7jhbZ2DAiEMGBpwCz5NQacqDv4PnEoBY_wojRapjtiU9Uzo5NLp-eV_e6pIWLg"
    const val REFRESH_TOKEN_BLACK_LISTED =
        "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhc2Vub2Nha0FkbWluIiwicm9sZXMiOlsiQURNSU4iXSwidHlwZSI6InJlZnJlc2giLCJleHAiOjE2NTM3MjkyNjcsImlhdCI6MTY1MzY0Mjg2N30.tV8oxWy6zg3ndQy0tfywZZ07amAX4n33e4Crda4SXE1W_9y9CEOxx8CwqI1de5CRDsnqc9LGOBS0YWnZOHF2lg"
}
