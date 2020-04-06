package ru.neoflex.nfcore.application.impl

import com.sun.jmx.remote.util.ClassLogger
import groovy.json.JsonOutput
import org.eclipse.emf.common.util.EList
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.*
import ru.neoflex.nfcore.dataset.impl.DatasetComponentImpl
import ru.neoflex.nfcore.notification.Notification
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity

import java.sql.*
import java.text.SimpleDateFormat

class YearBookExt extends YearBookImpl {

    @Override
    String createAllDays(String year, boolean excludeSaturdayAndSunday) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
                    def yearBook = resource.resources.get(0).contents.get(0) as YearBook
                    def myFormat = new SimpleDateFormat("yyyy-MM-dd");
                    def date1 = year + "-01-01";
                    def date2 = year + "-12-31";
                    def d1 = myFormat.parse(date1) as java.util.Date
                    def d2 = myFormat.parse(date2) as java.util.Date
                    while( d1.before(d2) ){
                        def day = ApplicationFactory.eINSTANCE.createDay()
                        if (excludeSaturdayAndSunday) {
                            if (d1.toDayOfWeek().ordinal() != 5 && d1.toDayOfWeek().ordinal() != 6) {
                                day.name = d1
                                yearBook.days.add(day)
                            }
                        }
                        else {
                            day.name = d1
                            yearBook.days.add(day)
                        }
                        d1 = addDays(d1, 1);
                    }
                    Context.current.store.updateEObject(yearBookRef, yearBook)
                    Context.current.store.commit("Entity was updated " + yearBookRef)
                    return JsonOutput.toJson("Days in entity " + yearBook.name + " were created")
                }
            }
        })
    }

    @Override
    String deleteAllDays() {
        def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
            def yearBook = resource.resources.get(0).contents.get(0) as YearBook
            yearBook.days.clear()
            Context.current.store.updateEObject(yearBookRef, yearBook)
            Context.current.store.commit("Entity was updated " + yearBookRef)
            return JsonOutput.toJson("Days in entity " + yearBook.name + " were deleted")
        }
    }
}
