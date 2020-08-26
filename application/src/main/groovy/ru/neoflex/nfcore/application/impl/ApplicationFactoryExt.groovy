package ru.neoflex.nfcore.application.impl

import ru.neoflex.nfcore.application.Calendar
import ru.neoflex.nfcore.application.YearBook

class ApplicationFactoryExt extends ApplicationFactoryImpl {

    @Override
    Calendar createCalendar() {
        return new CalendarExt()
    }

    @Override
    YearBook createYearBook() {
        return new YearBookExt()
    }

}
