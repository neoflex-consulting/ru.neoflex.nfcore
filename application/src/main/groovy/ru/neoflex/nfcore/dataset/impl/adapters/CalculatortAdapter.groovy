package ru.neoflex.nfcore.dataset.impl.adapters

abstract class CalculatorAdapter {
    String substring(String arg1, String arg2, String arg3) {
        return "substring(${arg1},${arg2},${arg3})"
    }

    String lower(String arg1) {
        return "lower(${arg1})"
    }

    String upper(String arg1) {
        return "upper(${arg1})"
    }

    String length(String arg1) {
        return "length(${arg1})"
    }

    String pi() {
        return "pi()"
    }

    String log10(String arg1) {
        return "log10(${arg1})"
    }

    String ceiling(String arg1) {
        return "ceiling(${arg1})"
    }

    String curdate() {
        return "curdate()"
    }

    String curtime() {
        return "curtime()"
    }

    String year(String arg1) {
        return "year(${arg1})"
    }

    String month(String arg1) {
        return "month(${arg1})"
    }

    String day(String arg1) {
        return "day(${arg1})"
    }

    String hour(String arg1) {
        return "hour(${arg1})"
    }

    String minute(String arg1) {
        return "minute(${arg1})"
    }

    String second(String arg1) {
        return "second(${arg1})"
    }

    static CalculatorAdapter getDBAdapter(String driver) {
        switch (driver) {
            case "org.postgresql.Driver":
                return PostgreCalculatorAdapter.getInstance()
            case "oracle.jdbc.driver.OracleDriver":
                return OracleCalculatorAdapter.getInstance()
            default:
                return DefaultCalculatorAdapter.getInstance()
        }
    }
}

class PostgreCalculatorAdapter extends CalculatorAdapter {
    private static final INSTANCE = new PostgreCalculatorAdapter()
    static getInstance() { return INSTANCE }

    @Override
    String substring(String arg1, String arg2, String arg3) {
        return "substring(cast(${arg1} as text),${arg2},${arg3})"
    }

    @Override
    String lower(String arg1) {
        return "lower(cast(${arg1} as text))"
    }

    @Override
    String upper(String arg1) {
        return "upper(cast(${arg1} as text))"
    }

    @Override
    String length(String arg1) {
        return "length(cast(${arg1} as text))"
    }

    @Override
    String log10(String arg1) {
        return "log(10,${arg1})"
    }
    @Override
    String curdate() {
        return "current_date"
    }

    @Override
    String curtime() {
        return "current_time"
    }

    @Override
    String year(String arg1) {
        return "extract(year from ${arg1})"
    }

    @Override
    String month(String arg1) {
        return "extract(month from ${arg1})"
    }

    @Override
    String day(String arg1) {
        return "extract(day from ${arg1})"
    }

    @Override
    String hour(String arg1) {
        return "extract(hour from ${arg1})"
    }

    @Override
    String minute(String arg1) {
        return "extract(minute from ${arg1})"
    }

    @Override
    String second(String arg1) {
        return "extract(second from ${arg1})"
    }
}

class OracleCalculatorAdapter extends CalculatorAdapter {
    private static final INSTANCE = new OracleCalculatorAdapter()
    static getInstance() { return INSTANCE }

    @Override
    String substring(String arg1, String arg2, String arg3) {
        return "substr(${arg1},${arg2},${arg3})"
    }

    @Override
    String pi() {
        return "2*asin(1)"
    }

    @Override
    String log10(String arg1) {
        return "log(10,${arg1})"
    }

    @Override
    String ceiling(String arg1) {
        return "ceil(${arg1})"
    }

    @Override
    String curdate() {
        return "to_char(current_date,'YYYY-MM-DD')"
    }

    @Override
    String curtime() {
        return "to_char(current_date,'HH24:Mi:SS')"
    }

    @Override
    String year(String arg1) {
        return "extract(year from ${arg1})"
    }

    @Override
    String month(String arg1) {
        return "extract(month from ${arg1})"
    }

    @Override
    String day(String arg1) {
        return "extract(day from ${arg1})"
    }

    @Override
    String hour(String arg1) {
        return "extract(hour from ${arg1})"
    }

    @Override
    String minute(String arg1) {
        return "extract(minute from ${arg1})"
    }

    @Override
    String second(String arg1) {
        return "extract(second from ${arg1})"
    }
}

class DefaultCalculatorAdapter extends CalculatorAdapter {
    private static final INSTANCE = new OracleCalculatorAdapter()
    static getInstance() { return INSTANCE }
}