package ru.neoflex.nfcore.application.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder

import java.text.SimpleDateFormat

class YearBookExt extends YearBookImpl {

    @Override
    String recreateWeekend(String year) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
                    def yearBook = resource.resources.get(0).contents.get(0) as YearBook
                    def dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                    def yearFormat = new SimpleDateFormat("yyyy");

                    def days = []
                    if (yearBook.days.size() != 0) {
                        for (int i = 0; i <= yearBook.days.size(); i++) {
                            def yearThis = yearFormat.parse(yearBook.days[i]) as java.util.Date
                            if (yearThis != year) {
                                days.push(yearBook.days[i])
                            }
                        }
                        yearBook.days.clear()
                    }

                    def date1 = year + "-01-01";
                    def date2 = year + "-12-31";
                    def d1 = dateFormat.parse(date1) as java.util.Date
                    def d2 = dateFormat.parse(date2) as java.util.Date
                    while( d1.before(d2) ){
                        def day = ApplicationFactory.eINSTANCE.createDay()
                            if (d1.toDayOfWeek().ordinal() == 5 && d1.toDayOfWeek().ordinal() == 6) {
                                day.date = d1
                                days.push(day)
                            }
                        d1 = addDays(d1, 1);
                    }
                    yearBook.days.addAll(days)
                    Context.current.store.updateEObject(yearBookRef, yearBook)
                    Context.current.store.commit("Entity was updated " + yearBookRef)
                    return JsonOutput.toJson("Days in entity " + yearBook.name + " were created")
                }
            }
        })
    }

//    @Override
//    String deleteAllDays() {
//        def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
//                .execute().resourceSet
//        if (!resource.resources.empty) {
//            def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
//            def yearBook = resource.resources.get(0).contents.get(0) as YearBook
//            yearBook.days.clear()
//            Context.current.store.updateEObject(yearBookRef, yearBook)
//            Context.current.store.commit("Entity was updated " + yearBookRef)
//            return JsonOutput.toJson("Days in entity " + yearBook.name + " were deleted")
//        }
//    }

    private static java.util.Date addDays(java.util.Date d1, int i) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(d1);
        cal.add(Calendar.DATE, 1);
        return cal.getTime();
    }
}
