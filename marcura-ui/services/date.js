angular.module('marcuraUI.services').factory('MaDate', [function () {
    var months = [{
        language: 'en',
        full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }],
        weekDays = [{
            language: 'en',
            full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        }],
        daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var isInteger = function (value) {
        return value === parseInt(value, 10);
    };

    var isDate = function (value) {
        if (!value) {
            return false;
        }

        return Object.prototype.toString.call(value) === '[object Date]' && value.getTime && !isNaN(value.getTime());
    };

    var isMaDate = function (value) {
        return value instanceof MaDate || (!!value && value._isMaDate);
    };

    var isMatch = function (date, substring) {
        return date.match(new RegExp(substring, 'i'));
    };

    var getTotalDate = function (year, month, day, hours, minutes, seconds, milliseconds, offset) {
        var finalMonth,
            maDate = MaDate.createEmpty();
        day = day.toString();
        month = month.toString();
        hours = Number(hours) || 0;
        minutes = Number(minutes) || 0;
        seconds = Number(seconds) || 0;
        milliseconds = Number(milliseconds) || 0;
        offset = offset || 0;

        // Convert YY to YYYY.
        if (year <= 99) {
            if (year >= 0 && year < 30) {
                year = '20' + year;
            } else {
                year = '19' + year;
            }
        }

        // Detect leap year and change amount of days in daysPerMonth for February.
        var isLeap = new Date(year, 1, 29).getMonth() === 1;

        if (isLeap) {
            daysPerMonth[1] = 29;
        } else {
            daysPerMonth[1] = 28;
        }

        // Convert month to number.
        if (month.match(/([^\u0000-\u0080]|[a-zA-Z])$/) !== null) {
            for (var j = 0; j < months.length; j++) {
                for (var i = 0; i < months[j].full.length; i++) {
                    if (isMatch(month, months[j].full[i].slice(0, 3))) {
                        finalMonth = i + 1;
                        break;
                    }
                }
            }

            if (!finalMonth) {
                return maDate;
            }

            month = finalMonth;
        }

        if (month > 12) {
            return maDate;
        }

        if (day > daysPerMonth[month - 1]) {
            return maDate;
        }

        var date = new Date(Number(year), Number(month - 1), Number(day), hours, minutes, seconds);
        date.setMilliseconds(milliseconds);

        maDate = new MaDate(date);
        maDate.offset(offset);

        return maDate;
    };

    var getDayAndMonth = function (day, month, culture) {
        var dayAndMonth = {
            day: day,
            month: month,
            isValid: true
        };

        // Handle difference between en-GB and en-US culture formats.
        if (culture === 'en-GB' && month > 12) {
            dayAndMonth.isValid = false;
        }

        if (culture === 'en-US') {
            dayAndMonth.day = month;
            dayAndMonth.month = day;

            if (day > 12) {
                dayAndMonth.isValid = false;
            }
        }

        // Give priority to en-GB if culture is not set.
        if (!culture && month > 12) {
            dayAndMonth.day = month;
            dayAndMonth.month = day;
        }

        return dayAndMonth;
    };

    var parse = function (value, culture) {
        var pattern, parts, dayAndMonth,
            date = MaDate.createEmpty();

        // Check if a date requires parsing.
        if (isDate(value) || isMaDate(value)) {
            return value;
        }

        if (typeof value !== 'string') {
            return date;
        }

        // Replace multiple whitespaces with a single one.
        value = value.replace(/\s+/g, ' ');

        // 21
        pattern = /^\d{1,2}$/;

        if (value.match(pattern) !== null) {
            var currentDate = new Date();

            return getTotalDate(currentDate.getFullYear(), currentDate.getMonth() + 1, value);
        }

        // 21-02
        pattern = /^(\d{1,2})(\/|-|\.|\s|)(\d{1,2})$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);
            dayAndMonth = getDayAndMonth(parts[1], parts[3], culture);

            if (!dayAndMonth.isValid) {
                return date;
            }

            return getTotalDate(new Date().getFullYear(), dayAndMonth.month, dayAndMonth.day);
        }

        // 21 Feb 15
        // 21 February 2015
        pattern = /^(\d{1,2})(\/|-|\.|\s|)([^\u0000-\u0080]|[a-zA-Z]{1,12})(\/|-|\.|\s|)(\d{2,4}\b)/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);

            return getTotalDate(parts[5], parts[3], parts[1]);
        }

        // Feb 21, 15
        // Feb 21, 2015
        pattern = /([^\u0000-\u0080]|[a-zA-Z]{3})(\s|)(\d{1,2})(,)(\s|)(\d{2,4})$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);

            return getTotalDate(parts[6], parts[1], parts[3]);
        }

        // Feb 21 15
        // February 21 2015
        pattern = /^([^\u0000-\u0080]|[a-zA-Z]{1,12})(\/|-|\.|\s|)(\d{1,2})(\/|-|\.|\s|)(\d{2,4}\b)/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);

            return getTotalDate(parts[5], parts[1], parts[3]);
        }

        // 2015-02-21
        pattern = /^(\d{4})(\/|-|\.|\s)(\d{1,2})(\/|-|\.|\s)(\d{1,2})$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);

            return getTotalDate(parts[1], parts[3], parts[5]);
        }

        // 21-02-15
        // 21-02-2015
        pattern = /^(\d{1,2})(\/|-|\.|\s|)(\d{1,2})(\/|-|\.|\s|)(\d{2,4})$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);
            dayAndMonth = getDayAndMonth(parts[1], parts[3], culture);

            if (!dayAndMonth.isValid) {
                return date;
            }

            return getTotalDate(parts[5], dayAndMonth.month, dayAndMonth.day);
        }

        // 2015-February-21
        pattern = /^(\d{4})(\/|-|\.|\s|)([^\u0000-\u0080]|[a-zA-Z]{1,12})(\/|-|\.|\s|)(\d{1,2})$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);

            return getTotalDate(parts[1], parts[3], parts[5]);
        }

        // 2015-02-21T10:00:00Z
        // 2015-02-21T10:00:00.652+03:00
        pattern = /^(\d{4})(\/|-|\.|\s)(\d{1,2})(\/|-|\.|\s)(\d{1,2})T(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)(\.(\d{3}))?(?:Z|([+-])(2[0-3]|[01][0-9]):([0-5][0-9]))$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);
            var offset = 0;

            // Get time zone offset.
            if (parts.length === 14) {
                offset = (Number(parts[12]) || 0) * 60 + (Number(parts[13]) || 0);

                if (parts[11] === '-' && offset !== 0) {
                    offset = -offset;
                }
            }

            return getTotalDate(parts[1], parts[3], parts[5], parts[6], parts[7], parts[8], parts[10], offset);
        }

        return date;
    };

    var formatNumber = function (number, length) {
        var string = '';

        for (var i = 0; i < length; i++) {
            string += '0';
        }

        return (string + number).slice(-length);
    };

    var isValidTimeZoneOffset = function (offset) {
        return offset >= -720 && offset <= 840;
    };

    var offsetToTimeZone = function (offset) {
        if (offset === 0) {
            return 'Z';
        }

        if (!isInteger(offset)) {
            return null;
        }

        // Time zones vary from -12:00 to 14:00.
        if (offset < -720 || offset > 840) {
            return null;
        }

        var sign = '+';

        if (offset < 0) {
            offset *= -1;
            sign = '-';
        }

        var minutes = offset % 60,
            hours = (offset - minutes) / 60;

        return sign + formatNumber(hours, 2) + ':' + formatNumber(minutes, 2);
    };

    /*
        Overloads:
        - format(date)
        - format(MaDate)
        - format(date, format)
        - format(MaDate, format)
        - format(date, offset)
        - format(MaDate, offset)
        - format(date, format, offset)
        - format(MaDate, format, offset)
    */
    var format = function (date) {
        if (!isDate(date) && !isMaDate(date)) {
            return null;
        }

        var parameters = arguments,
            format,
            offset = 0;

        if (parameters.length === 2) {
            if (typeof parameters[1] === 'string') {
                format = parameters[1];
            } else {
                offset = parameters[1];

                if (!isValidTimeZoneOffset(offset)) {
                    return null;
                }
            }
        } else if (parameters.length === 3) {
            format = parameters[1];
            offset = parameters[2];

            if (!isValidTimeZoneOffset(offset)) {
                return null;
            }
        }

        format = format || 'yyyy-MM-ddTHH:mm:ssZ';

        var languageIndex = 0,
            timeZone = offsetToTimeZone(offset),
            _date = isMaDate(date) ? date.toDate() : date,
            // Possible formats of date parts (day, month, year).
            datePartFormats = {
                f: ['fff'],
                s: ['ss'],
                m: ['mm'],
                H: ['HH'],
                d: ['d', 'dd', 'ddd', 'dddd'],
                M: ['M', 'MM', 'MMM', 'MMMM'],
                y: ['yy', 'yyyy'],
                Z: ['Z']
            },
            day = _date.getDate(),
            dayOfWeek = _date.getDay(),
            month = _date.getMonth(),
            year = _date.getFullYear(),
            hours = _date.getHours(),
            minutes = _date.getMinutes(),
            seconds = _date.getSeconds(),
            milliseconds = _date.getMilliseconds();

        // Checks format string parts on conformity with available date formats.
        var checkDatePart = function (dateChar) {
            var datePart = '';

            // Try-catch construction because some sub-formats may be not listed.
            try {
                datePart = format.match(new RegExp(dateChar + '+', ''))[0];
            } catch (error) { }

            return datePartFormats[dateChar].indexOf(datePart);
        };

        // Formats date parts.
        var formatDatePart = function (datePartFormat) {
            var datePart = '';

            switch (datePartFormat) {
                case datePartFormats.d[0]:
                    // d
                    {
                        datePart = day;
                        break;
                    }
                case datePartFormats.d[1]:
                    // dd
                    {
                        datePart = formatNumber(day, 2);
                        break;
                    }
                case datePartFormats.d[2]:
                    // ddd
                    {
                        datePart = weekDays[languageIndex].short[dayOfWeek];
                        break;
                    }
                case datePartFormats.d[3]:
                    // dddd
                    {
                        datePart = weekDays[languageIndex].full[dayOfWeek];
                        break;
                    }
                case datePartFormats.M[0]:
                    // M
                    {
                        datePart = month + 1;
                        break;
                    }
                case datePartFormats.M[1]:
                    // MM
                    {
                        datePart = formatNumber(month + 1, 2);
                        break;
                    }
                case datePartFormats.M[2]:
                    // MMM
                    {
                        datePart = months[languageIndex].short[month];
                        break;
                    }
                case datePartFormats.M[3]:
                    // MMMM
                    {
                        datePart = months[languageIndex].full[month];
                        break;
                    }
                case datePartFormats.y[0]:
                    // yy
                    {
                        datePart = formatNumber(year, 2);
                        break;
                    }
                case datePartFormats.y[1]:
                    // yyyy
                    {
                        datePart = year;
                        break;
                    }
                case datePartFormats.H[0]:
                    // HH
                    {
                        datePart = formatNumber(hours, 2);
                        break;
                    }
                case datePartFormats.m[0]:
                    // mm
                    {
                        datePart = formatNumber(minutes, 2);
                        break;
                    }
                case datePartFormats.s[0]:
                    // ss
                    {
                        datePart = formatNumber(seconds, 2);
                        break;
                    }
                case datePartFormats.f[0]:
                    // fff
                    {
                        datePart = formatNumber(milliseconds, 3);
                        break;
                    }
                case datePartFormats.Z[0]:
                    // Z
                    {
                        datePart = timeZone || 'Z';
                        break;
                    }
                default:
                    {
                        return '';
                    }
            }

            return datePart;
        };

        // Check format of each part of the obtained format.
        var dateParts = {
            days: formatDatePart(datePartFormats.d[checkDatePart('d')]),
            months: formatDatePart(datePartFormats.M[checkDatePart('M')]),
            years: formatDatePart(datePartFormats.y[checkDatePart('y')]),
            hours: formatDatePart(datePartFormats.H[checkDatePart('H')]),
            minutes: formatDatePart(datePartFormats.m[checkDatePart('m')]),
            seconds: formatDatePart(datePartFormats.s[checkDatePart('s')]),
            milliseconds: formatDatePart(datePartFormats.f[checkDatePart('f')]),
            timeZone: formatDatePart(datePartFormats.Z[0]),
            separator: /^\w+([^\w])/.exec(format)
        };

        // TODO: Workarounds.
        if (format === 'ddd') {
            return format.replace(/d+/, dateParts.days);
        }

        // Return formatted date string.
        return format
            .replace(/d+/, dateParts.days)
            .replace(/y+/, dateParts.years)
            .replace(/M+/, dateParts.months)
            .replace(/H+/, dateParts.hours)
            .replace(/m+/, dateParts.minutes)
            .replace(/s+/, dateParts.seconds)
            .replace(/f+/, dateParts.milliseconds)
            .replace(/Z+/, dateParts.timeZone);
    };

    var parseTimeZone = function (timeZone) {
        if (!timeZone) {
            return 0;
        }

        timeZone = timeZone.replace(/GMT/gi, '');

        var parts = /^(?:Z|([+-]?)(2[0-3]|[01][0-9]):([0-5][0-9]))$/.exec(timeZone);

        if (!parts || parts.length !== 4) {
            return 0;
        }

        if (parts[0] === 'Z') {
            return 0;
        }

        // Calculate time zone offset in minutes.
        var offset = Number(parts[2]) * 60 + Number(parts[3]);

        if (offset !== 0 && parts[1] === '-') {
            offset *= -1;
        }

        return offset;
    };

    /*
        Overloads:
        - new MaDate()
        - new MaDate(useLocalTimeZone)
        - new MaDate(Date)
        - new MaDate(MaDate)
        - new MaDate(dateString)
        - new MaDate(dateString, culture)
        - new MaDate(year)
        - new MaDate(year, month)
        - new MaDate(year, month, date)
        - new MaDate(year, month, date, hour)
        - new MaDate(year, month, date, hour, minute)
        - new MaDate(year, month, date, hour, minute, second)
    */
    function MaDate() {
        var parameters = arguments,
            date;
        this._date = null;
        this._offset = 0;
        this._isMaDate = true;

        if (parameters.length === 0) {
            // Create a current date.
            this._date = new Date();
        } else if (parameters.length === 1) {
            date = parameters[0];

            if (isDate(date)) {
                this._date = new Date(date.valueOf());
            } else if (isMaDate(date)) {
                // MaDate is provided - copy it.
                if (!date.isEmpty()) {
                    this._date = new Date(date.toDate().valueOf());
                }

                this._offset = date.offset();
            } else if (typeof date === 'boolean') {
                this._date = new Date();
                this._offset = -this._date.getTimezoneOffset();
            } else if (typeof date === 'string') {
                // Parse date.
                date = parse(date);
                this._date = date.toDate();
                this._offset = date.offset();
            } else if (isInteger(date)) {
                // Year.
                this._date = new Date(date, 0, 1, 0, 0, 0);
            }
        } else if (parameters.length === 2) {
            // Date string and culture.
            if (typeof parameters[0] === 'string' && typeof parameters[1] === 'string') {
                date = parse(parameters[0], parameters[1]);
                this._date = date.toDate();
                this._offset = date.offset();
            } else if (isInteger(parameters[0]) && isInteger(parameters[1])) {
                // Year and month.
                this._date = new Date(parameters[0], parameters[1], 1, 0, 0, 0);
            }
        } else if (parameters.length === 3 && isInteger(parameters[0]) && isInteger(parameters[1]) && isInteger(parameters[2])) {
            // Year, month and date.
            this._date = new Date(parameters[0], parameters[1], parameters[2], 0, 0, 0);
        } else if (parameters.length === 4 && isInteger(parameters[0]) && isInteger(parameters[1]) && isInteger(parameters[2]) && isInteger(parameters[3])) {
            // Year, month and date.
            this._date = new Date(parameters[0], parameters[1], parameters[2], parameters[3], 0, 0);
        } else if (parameters.length === 5 && isInteger(parameters[0]) && isInteger(parameters[1]) && isInteger(parameters[2]) && isInteger(parameters[3]) &&
            isInteger(parameters[4])) {
            // Year, month and date.
            this._date = new Date(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], 0);
        } else if (parameters.length === 6 && isInteger(parameters[0]) && isInteger(parameters[1]) && isInteger(parameters[2]) && isInteger(parameters[3]) &&
            isInteger(parameters[4]) && isInteger(parameters[5])) {
            // Year, month and date.
            this._date = new Date(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
        }
    }

    MaDate.createEmpty = function () {
        return new MaDate(null);
    };

    MaDate.createLocal = function () {
        return new MaDate(true);
    };

    MaDate.prototype.copy = function () {
        return new MaDate(this);
    };

    MaDate.prototype.toDate = function () {
        return this._date;
    };

    MaDate.prototype.offset = function (offset) {
        if (arguments.length === 0) {
            return this._offset;
        }

        this._offset = offset;
        return this;
    };

    MaDate.prototype.toUtc = function () {
        if (this.isEmpty() || this._offset === 0) {
            return this;
        }

        this.subtract(this._offset, 'minute');
        this._offset = 0;

        return this;
    };

    MaDate.prototype.isEmpty = function () {
        return !this._date;
    };

    MaDate.prototype.isUtc = function () {
        return !this.isEmpty() && this._offset === 0;
    };

    MaDate.prototype.isEqual = function (date) {
        return this.difference(date) === 0;
    };

    MaDate.prototype.isLess = function (date) {
        return this.difference(date) < 0;
    };

    MaDate.prototype.isLessOrEqual = function (date) {
        return this.difference(date) <= 0;
    };

    MaDate.prototype.isGreater = function (date) {
        return this.difference(date) > 0;
    };

    MaDate.prototype.isGreaterOrEqual = function (date) {
        return this.difference(date) >= 0;
    };

    MaDate.prototype.isBetween = function (startDate, endDate, isInclusive) {
        var _startDate = new MaDate(startDate),
            _endDate = new MaDate(endDate);

        if (this.isEmpty() || _startDate.isEmpty() || _endDate.isEmpty()) {
            return false;
        }

        if (isInclusive) {
            return this.isGreaterOrEqual(_startDate) && this.isLessOrEqual(_endDate);
        }

        return this.isGreater(_startDate) && this.isLess(_endDate);
    };

    MaDate.prototype.difference = function (date) {
        return this.valueOf() - new MaDate(date).valueOf();
    };

    MaDate.prototype.valueOf = function () {
        if (this.isEmpty()) {
            return 0;
        }

        var time = this._date.valueOf();

        // Add offset which is in minutes, and thus should be converted to milliseconds.
        if (this._offset !== 0) {
            time -= this._offset * 60000;
        }

        return time;
    };

    MaDate.prototype.format = function (_format) {
        if (this.isEmpty()) {
            return null;
        }

        return format(this._date, _format, this._offset);
    };

    MaDate.prototype.add = function (number, unit) {
        if (this.isEmpty() || !number) {
            return this;
        }

        // Don't change original date.
        var date = new Date(this._date);

        switch (unit) {
            case 'year':
                date.setFullYear(date.getFullYear() + number);
                break;
            case 'quarter':
                date.setMonth(date.getMonth() + 3 * number);
                break;
            case 'month':
                date.setMonth(date.getMonth() + number);
                break;
            case 'week':
                date.setDate(date.getDate() + 7 * number);
                break;
            case 'day':
                date.setDate(date.getDate() + number);
                break;
            case 'hour':
                date.setTime(date.getTime() + number * 3600000);
                break;
            case 'minute':
                date.setTime(date.getTime() + number * 60000);
                break;
            case 'second':
                date.setTime(date.getTime() + number * 1000);
                break;
            case 'millisecond':
                date.setTime(date.getTime() + number);
                break;
        }

        this._date = date;

        return this;
    };

    MaDate.prototype.subtract = function (number, unit) {
        return this.add(number * -1, unit);
    };

    MaDate.prototype.millisecond = function (millisecond) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getMilliseconds();
        } else {
            this._date.setMilliseconds(millisecond);
            return this;
        }
    };

    MaDate.prototype.second = function (second) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getSeconds();
        } else {
            this._date.setSeconds(second);
            return this;
        }
    };

    MaDate.prototype.minute = function (minute) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getMinutes();
        } else {
            this._date.setMinutes(minute);
            return this;
        }
    };

    MaDate.prototype.hour = function (hour) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getHours();
        } else {
            this._date.setHours(hour);
            return this;
        }
    };

    MaDate.prototype.date = function (date) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getDate();
        } else {
            this._date.setDate(date);
            return this;
        }
    };

    MaDate.prototype.month = function (month) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getMonth();
        } else {
            this._date.setMonth(month);
            return this;
        }
    };

    MaDate.prototype.year = function (year) {
        if (this.isEmpty()) {
            return 0;
        }

        if (arguments.length === 0) {
            return this._date.getFullYear();
        } else {
            this._date.setFullYear(year);
            return this;
        }
    };

    MaDate.prototype.startOf = function (unit) {
        switch (unit) {
            case 'year':
                this.month(0);
            /* falls through */
            case 'month':
                this.date(1);
            /* falls through */
            case 'day':
                this.hour(0);
            /* falls through */
            case 'hour':
                this.minute(0);
            /* falls through */
            case 'minute':
                this.second(0);
            /* falls through */
            case 'second':
                this.millisecond(0);
        }

        return this;
    };

    MaDate.prototype.endOf = function (unit) {
        if (!unit) {
            return this;
        }

        return this.startOf(unit).add(1, unit).subtract(1, 'millisecond');
    };

    MaDate.parse = parse;
    MaDate.parseTimeZone = parseTimeZone;
    MaDate.offsetToTimeZone = offsetToTimeZone;
    MaDate.isDate = isDate;
    MaDate.isMaDate = isMaDate;

    return MaDate;
}]);