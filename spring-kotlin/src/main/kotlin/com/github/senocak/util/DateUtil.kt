package com.github.senocak.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import java.text.ParseException;

object DateUtil {
    private const val SECOND_MILLIS = 1000
    private const val MINUTE_MILLIS = 60 * SECOND_MILLIS
    private const val HOUR_MILLIS = 60 * MINUTE_MILLIS

    fun diffForHumans(time: Long): String? {
        var _time = time
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = _time
        val year = calendar[Calendar.YEAR]
        val currentYear = Calendar.getInstance()[Calendar.YEAR]
        if (_time < 1000000000000L)
            _time *= 1000
        val now = System.currentTimeMillis()
        if (_time > now || _time <= 0)
            return null

        val diff = now - _time
        return  if (diff < MINUTE_MILLIS) "just now"
                else if (diff < 2 * MINUTE_MILLIS) "a minute ago"
                else if (diff < 50 * MINUTE_MILLIS) (diff / MINUTE_MILLIS).toString() + " minutes ago"
                else if (diff < 90 * MINUTE_MILLIS) "an hour ago"
                else if (diff < 24 * HOUR_MILLIS) (diff / HOUR_MILLIS).toString() + " hours ago"
                else if (diff < 48 * HOUR_MILLIS) "yesterday at " + SimpleDateFormat("hh:mm a").format(calendar.time)
                else if (year == currentYear) "On " + SimpleDateFormat("MMM dd hh:mm a").format(calendar.time)
                else "On " + SimpleDateFormat("yyyy MMM dd hh:mm a").format(calendar.time)
    }

    @Throws(ParseException::class)
    fun getDateCurrentTimeZone(dateString: String?): Date {
        val sdf = SimpleDateFormat("dd-M-yyyy hh:mm:ss")
        val date: Date = sdf.parse(dateString)
        val calendar = Calendar.getInstance()
        val tz = TimeZone.getDefault()
        calendar.timeInMillis = date.getTime()
        calendar.add(Calendar.MILLISECOND, tz.getOffset(calendar.timeInMillis))
        return calendar.time
    }
}