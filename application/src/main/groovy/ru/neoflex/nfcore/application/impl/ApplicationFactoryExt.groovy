package ru.neoflex.nfcore.application.impl

import ru.neoflex.nfcore.application.Calendar
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.dataset.DatasetComponent
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.impl.DatasetComponentExt
import ru.neoflex.nfcore.dataset.impl.DatasetFactoryImpl
import ru.neoflex.nfcore.dataset.impl.JdbcDatasetExt

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
