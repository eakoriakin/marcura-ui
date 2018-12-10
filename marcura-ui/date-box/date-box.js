angular.module('marcuraUI.components')
    .provider('maDateBoxConfiguration', function () {
        this.$get = function () {
            return this;
        };
    })
    .directive('maDateBox', ['$timeout', 'MaDate', 'MaHelper', 'MaValidators', function ($timeout, MaDate, MaHelper, MaValidators) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                value: '=',
                timeZone: '=',
                culture: '=',
                isDisabled: '=',
                isRequired: '=',
                isLoading: '=',
                change: '&',
                validate: '&',
                canReset: '=',
                displayFormat: '=',
                format: '=',
                hasTime: '=',
                parser: '=',
                validators: '=',
                instance: '=',
                min: '=',
                max: '=',
                changeTimeout: '=',
                placeholder: '@',
                modifier: '@',
                eventDates: '=',
                disabledDates: '=',
                message: '@'
            },
            replace: true,
            template: function (element) {
                var html = '\
                <div class="ma-date-box" ng-class="{\
                        \'ma-date-box-has-time\': hasTime,\
                        \'ma-date-box-is-invalid\': !isValid,\
                        \'ma-date-box-is-disabled\': isDisabled,\
                        \'ma-date-box-is-focused\': isFocused,\
                        \'ma-date-box-is-touched\': isTouched,\
                        \'ma-date-box-can-reset\': canReset,\
                        \'ma-date-box-is-loading\': isLoading,\
                        \'ma-date-box-is-reset-disabled\': canReset && !isDisabled && !isResetEnabled(),\
                        \'ma-date-box-has-value\': hasValue()\
                    }">\
                    <div class="ma-date-box-inner">\
                        <input class="ma-date-box-date" type="text" id="{{id}}"\
                            placeholder="{{placeholder}}"\
                            ng-disabled="isDisabled"\
                            ng-keydown="onKeydown($event)"\
                            ng-keyup="onKeyup($event)"/><input class="ma-date-box-hour"\
                                maxlength="2"\
                                ng-disabled="isDisabled"\
                                ng-show="hasTime"\
                                ng-keyup="onKeyup($event)"\
                                ng-keydown="onTimeKeydown($event)"\
                                /><div class="ma-date-box-colon" ng-if="hasTime">:</div><input \
                                class="ma-date-box-minute" type="text"\
                                maxlength="2"\
                                ng-disabled="isDisabled"\
                                ng-show="hasTime"\
                                ng-keyup="onKeyup($event)"\
                                ng-keydown="onTimeKeydown($event)"/>\
                        <i class="ma-date-box-icon fa fa-calendar"></i>\
                    </div>\
                    <ma-button class="ma-button-reset"\
                        ng-show="canReset" size="xs" simple\
                        right-icon="times-circle"\
                        click="onReset()"\
                        is-disabled="{{!isResetEnabled()}}">\
                    </ma-button>\
                    <div class="ma-date-box-spinner" ng-if="isLoading && !isDisabled">\
                        <div class="ma-pace">\
                            <div class="ma-pace-activity"></div>\
                        </div>\
                    </div>\
                </div>';

                return html;
            },
            controller: ['$scope', 'maDateBoxConfiguration', function (scope, maDateBoxConfiguration) {
                scope.configuration = {};
                scope.configuration.displayFormat = (scope.displayFormat || maDateBoxConfiguration.displayFormat || 'dd MMM yyyy')
                    .replace(/Y/g, 'y').replace(/D/g, 'd');
                scope.configuration.format = (scope.format || maDateBoxConfiguration.format || 'yyyy-MM-ddTHH:mm:ssZ')
                    .replace(/Y/g, 'y').replace(/D/g, 'd');
                scope.configuration.timeZone = (scope.timeZone || maDateBoxConfiguration.timeZone || 'Z')
                    .replace(/GMT/g, '');
            }],
            link: function (scope, element) {
                var picker = null,
                    displayFormat = scope.configuration.displayFormat,
                    format = scope.configuration.format,
                    timeZone = scope.configuration.timeZone,
                    dateElement = angular.element(element[0].querySelector('.ma-date-box-date')),
                    hourElement = angular.element(element[0].querySelector('.ma-date-box-hour')),
                    minuteElement = angular.element(element[0].querySelector('.ma-date-box-minute')),
                    previousDate = MaDate.createEmpty(),
                    timeZoneOffset = MaDate.parseTimeZone(timeZone),
                    initialDisplayDate,
                    // Variables keydownValue and keyupValue help track touched state.
                    keydownValue,
                    keyupValue,
                    initialDateOffset = 0,
                    validators = [],
                    isRequired = scope.isRequired,
                    minDate = new MaDate(scope.min),
                    maxDate = new MaDate(scope.max),
                    failedValidator = null,
                    changePromise,
                    changeTimeout = Number(scope.changeTimeout),
                    dateCaretPosition = 0,
                    hourCaretPosition = 0,
                    minuteCaretPosition = 0,
                    isDateFocused,
                    isHourFocused,
                    isMinuteFocused,
                    eventDates = [];

                var hasDateChanged = function (date) {
                    if (previousDate.isEqual(date)) {
                        return false;
                    }

                    scope.isTouched = true;

                    return true;
                };

                // Returns null if display date is invalid.
                var getDisplayDate = function () {
                    var displayDate = dateElement.val().trim(),
                        isEmpty = displayDate === '',
                        hour = Number(hourElement.val()),
                        minute = Number(minuteElement.val()),
                        date = MaDate.createEmpty();

                    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                        return null;
                    }

                    if (isEmpty) {
                        return date;
                    }

                    date = new MaDate(displayDate);

                    // Date can't be parsed.
                    if (date.isEmpty()) {
                        return null;
                    }

                    date.add(hour, 'hour');
                    date.add(minute, 'minute');
                    date.offset(initialDateOffset);

                    return date;
                };

                var setDisplayDate = function (date) {
                    var displayDate = null;

                    if (date && !date.isEmpty()) {
                        // Adjust display date offset.
                        displayDate = date.copy().toUtc().add(timeZoneOffset, 'minute');
                        dateElement.val(displayDate.format(displayFormat));
                        hourElement.val(displayDate.format('HH'));
                        minuteElement.val(displayDate.format('mm'));

                        if (!initialDisplayDate) {
                            initialDisplayDate = dateElement.val();
                        }
                    } else {
                        dateElement.val('');
                        hourElement.val('00');
                        minuteElement.val('00');
                    }

                    // Restore caret position if the component has focus.
                    if (scope.isFocused) {
                        // In IE setting selectionStart/selectionEnd properties triggers focus/blur event.
                        // Remove the events while properties are being set and then restore them.
                        removeFocusEvent();
                        removeBlurEvent();

                        // Set caret for an appropriate field.
                        if (isDateFocused) {
                            dateElement.prop({
                                selectionStart: dateCaretPosition,
                                selectionEnd: dateCaretPosition
                            });
                        }

                        if (isHourFocused) {
                            hourElement.prop({
                                selectionStart: hourCaretPosition,
                                selectionEnd: hourCaretPosition
                            });
                        }

                        if (isMinuteFocused) {
                            minuteElement.prop({
                                selectionStart: minuteCaretPosition,
                                selectionEnd: minuteCaretPosition
                            });
                        }

                        $timeout(function () {
                            addFocusEvent();
                            addBlurEvent();
                        });
                    }

                    // Set calendar date.
                    if (picker) {
                        picker.setDate(displayDate ? displayDate.toDate() : null, true);
                    }
                };

                var setMaxDate = function () {
                    if (!picker) {
                        return;
                    }

                    maxDate = new MaDate(scope.max);

                    // Pikaday does no support clearing maxDate by providing null value.
                    // So we just set maxDate to 100 years ahead.
                    if (maxDate.isEmpty()) {
                        maxDate = new MaDate().add(100, 'year');
                    }

                    picker.setMaxDate(maxDate.toDate());
                };

                var setMinDate = function () {
                    if (!picker) {
                        return;
                    }

                    minDate = new MaDate(scope.min);

                    // Pikaday does no support clearing minDate by providing null value.
                    // So we just set minDate to 100 years before.
                    if (minDate.isEmpty()) {
                        minDate = new MaDate().subtract(100, 'year');
                    }

                    picker.setMinDate(minDate.toDate());
                };

                var parseDate = function (date) {
                    var parsedDate = MaDate.createEmpty();

                    if (!date) {
                        return parsedDate;
                    }

                    if (scope.parser) {
                        parsedDate = scope.parser(date);
                    } else {
                        parsedDate = MaDate.parse(date, scope.culture);
                    }

                    return parsedDate;
                };

                var setDateTime = function (date) {
                    date.hour(Number(hourElement.val()))
                        .minute(Number(minuteElement.val()))
                        .second(0);
                };

                var resetInitialDateOffset = function () {
                    // Override initial time zone offset after date has been changed.
                    initialDateOffset = timeZoneOffset;
                };

                var isDateDisabled = function (date) {
                    var _isDateDisabled = false,
                        _date = new MaDate(date).offset(timeZoneOffset);

                    if (scope.disabledDates && scope.disabledDates.length) {
                        for (var i = 0; i < scope.disabledDates.length; i++) {
                            var disabledDate = new MaDate(scope.disabledDates[i]).offset(timeZoneOffset);

                            if (_date.isEqual(disabledDate)) {
                                _isDateDisabled = true;
                                break;
                            }
                        }
                    }

                    return _isDateDisabled;
                };

                var initializePikaday = function () {
                    var theme = 'ma-pika';

                    if (!MaHelper.isNullOrWhiteSpace(scope.modifier)) {
                        var modifiers = scope.modifier.split(' ');

                        for (var i = 0; i < modifiers.length; i++) {
                            theme += ' ma-pika-' + modifiers[i];
                        }
                    }

                    picker = new Pikaday({
                        field: angular.element(element[0].querySelector('.ma-date-box-icon'))[0],
                        position: 'bottom right',
                        onSelect: function () {
                            var date = new MaDate(picker.getDate());
                            date.offset(timeZoneOffset);

                            if (scope.hasTime) {
                                setDateTime(date);
                                resetInitialDateOffset();
                            }

                            // Use $timeout to apply scope changes instead of $apply,
                            // which throws digest error at this point.
                            $timeout(function () {
                                validate(date);
                            });

                            if (!hasDateChanged(date)) {
                                // Refresh display date in case the following scenario.
                                // 1. maxDate is set to 30/10/2016.
                                // 2. The user enteres greater date by hand 31/10/2016, which
                                // will not be excepted and become invalid.
                                // 3. The user then selects the same 30/10/2016 date from the calendar,
                                // but display date will not be changed as previous date is still 30/10/2016
                                // (hasDateChanged will return false).
                                setDisplayDate(date);
                                return;
                            }

                            triggerChange(date);
                        },
                        onDraw: function () {
                            if (scope.message) {
                                $(picker.el).append('<div class="ma-pika-message">' + scope.message + '</div>');
                            }
                        },
                        disableDayFn: isDateDisabled,
                        events: eventDates,
                        theme: theme
                    });

                    setDisplayDate(previousDate);
                    setMaxDate();
                    setMinDate();
                };

                var destroyPikaday = function () {
                    if (picker) {
                        picker.destroy();
                    }
                };

                var validate = function (date, triggerEvent) {
                    scope.isValid = true;
                    failedValidator = null;
                    triggerEvent = triggerEvent !== undefined ? triggerEvent : true;
                    var formattedDate = date ? date.format(format) : null;

                    if (validators && validators.length) {
                        for (var i = 0; i < validators.length; i++) {
                            if (!validators[i].validate(formattedDate)) {
                                scope.isValid = false;
                                failedValidator = validators[i];
                                break;
                            }
                        }
                    }

                    if (triggerEvent !== false) {
                        triggerValidate(date);
                    }
                };

                var setValidators = function () {
                    var hasIsNotEmptyValidator = false;
                    validators = scope.validators ? angular.copy(scope.validators) : [];

                    for (var i = 0; i < validators.length; i++) {
                        if (validators[i].name === 'IsNotEmpty') {
                            hasIsNotEmptyValidator = true;
                            break;
                        }
                    }

                    if (!hasIsNotEmptyValidator && isRequired) {
                        validators.unshift(MaValidators.isNotEmpty());
                    }

                    if (hasIsNotEmptyValidator) {
                        isRequired = true;
                    }

                    if (!minDate.isEmpty()) {
                        validators.push(MaValidators.isGreaterOrEqual(minDate, true));
                    }

                    if (!maxDate.isEmpty()) {
                        validators.push(MaValidators.isLessOrEqual(maxDate, true));
                    }

                    if (scope.disabledDates && scope.disabledDates.length) {
                        validators.push({
                            name: 'IsDisabled',
                            message: 'Date is disabled.',
                            validate: function (date) {
                                return !isDateDisabled(date);
                            }
                        });
                    }
                };

                var triggerChange = function (date) {
                    previousDate = date || MaDate.createEmpty();
                    scope.value = date ? date.format(format) : null;

                    // Postpone change event for $apply (which is being invoked by $timeout)
                    // to have time to take effect and update scope.value,
                    // so both maValue and scope.value have the same values eventually.
                    $timeout(function () {
                        scope.change({
                            maValue: scope.value
                        });
                    });
                };

                var triggerValidate = function (date) {
                    // Postpone the event to allow scope.value to be updated, so
                    // the event can operate relevant value.
                    $timeout(function () {
                        scope.validate({
                            maValue: date ? date.format(format) : null
                        });
                    });
                };

                var changeDate = function () {
                    scope.isTouched = true;

                    var displayDate = dateElement.val().trim(),
                        isEmpty = displayDate === '',
                        hour = Number(hourElement.val()),
                        minute = Number(minuteElement.val()),
                        date = MaDate.createEmpty();

                    // Check time.
                    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                        date = parseDate(displayDate);
                        date.offset(initialDateOffset);
                    } else {
                        scope.isValid = false;
                        return;
                    }

                    // Date is empty and remains unchanged.
                    if (isEmpty && previousDate.isEmpty()) {
                        validate(null);
                        return;
                    }

                    // Date has been emptied.
                    if (isEmpty) {
                        validate(date);

                        if (scope.isValid) {
                            setDisplayDate(null);
                            triggerChange();
                        }

                        return;
                    }

                    // Failed to parse the date.
                    if (date.isEmpty()) {
                        scope.isValid = false;
                        return;
                    }

                    if (!date.isEmpty() && (scope.hasTime || initialDisplayDate === displayDate)) {
                        setDateTime(date);

                        // Substruct time zone offset.
                        date.subtract(timeZoneOffset - initialDateOffset, 'minute');
                    }

                    validate(date);

                    if (!hasDateChanged(date)) {
                        // Refresh diplay date in case the user changed its format, e.g.
                        // from 12 Oct 16 to 12Oct16. We need to set it back to 12 Oct 16.
                        setDisplayDate(date);
                        return;
                    }

                    if (!date.isEmpty()) {
                        setDisplayDate(date);
                    }

                    if (!scope.isValid) {
                        return;
                    }

                    triggerChange(date);
                };

                var focusDate = function () {
                    isDateFocused = true;
                    isHourFocused = false;
                    isMinuteFocused = false;
                    scope.onFocus();
                };

                var focusHour = function () {
                    isHourFocused = true;
                    isDateFocused = false;
                    isMinuteFocused = false;
                    scope.onFocus();
                };

                var focusMinute = function () {
                    isMinuteFocused = true;
                    isDateFocused = false;
                    isHourFocused = false;
                    scope.onFocus();
                };

                var blurDate = function () {
                    isDateFocused = false;
                    scope.onBlur();
                };

                var blurHour = function () {
                    isHourFocused = false;
                    scope.onBlur();
                };

                var blurMinute = function () {
                    isMinuteFocused = false;
                    scope.onBlur();
                };

                var addFocusEvent = function () {
                    // Remove the event in case it exists.
                    removeFocusEvent();
                    $('.ma-date-box-date', element).on('focus', focusDate);
                    $('.ma-date-box-hour', element).on('focus', focusHour);
                    $('.ma-date-box-minute', element).on('focus', focusMinute);
                };

                var removeFocusEvent = function () {
                    $('.ma-date-box-date', element).off('focus', focusDate);
                    $('.ma-date-box-hour', element).off('focus', focusHour);
                    $('.ma-date-box-minute', element).off('focus', focusMinute);
                };

                var addBlurEvent = function () {
                    // Remove the event in case it exists.
                    removeBlurEvent();
                    $('.ma-date-box-date', element).on('blur', blurDate);
                    $('.ma-date-box-hour', element).on('blur', blurHour);
                    $('.ma-date-box-minute', element).on('blur', blurMinute);
                };

                var removeBlurEvent = function () {
                    $('.ma-date-box-date', element).off('blur', blurDate);
                    $('.ma-date-box-hour', element).off('blur', blurHour);
                    $('.ma-date-box-minute', element).off('blur', blurMinute);
                };

                var setModifiers = function (oldModifiers) {
                    // Remove previous modifiers first.
                    if (!MaHelper.isNullOrWhiteSpace(oldModifiers)) {
                        oldModifiers = oldModifiers.split(' ');

                        for (var i = 0; i < oldModifiers.length; i++) {
                            element.removeClass('ma-date-box-' + oldModifiers[i]);
                        }
                    }

                    var modifiers = '';

                    if (!MaHelper.isNullOrWhiteSpace(scope.modifier)) {
                        modifiers = scope.modifier.split(' ');
                    }

                    for (var j = 0; j < modifiers.length; j++) {
                        element.addClass('ma-date-box-' + modifiers[j]);
                    }
                };

                var setEventDates = function () {
                    eventDates = [];

                    if (scope.eventDates && scope.eventDates.length) {
                        for (var i = 0; i < scope.eventDates.length; i++) {
                            var event = new MaDate(scope.eventDates[i]);
                            eventDates.push(event.format('ddd') + ' ' + event.format('MMM dd yyyy'));
                        }
                    }

                    // Refresh calendar.
                    if (picker && picker._o) {
                        picker._o.events = eventDates;
                        picker.draw();
                    }
                };

                setValidators();
                scope.isFocused = false;
                scope.isValid = true;
                scope.isTouched = false;

                scope.hasValue = function () {
                    return (dateElement.val() || hourElement.val() !== '00' || minuteElement.val() !== '00') &&
                        !scope.isLoading;
                };

                scope.isResetEnabled = function () {
                    return !scope.isDisabled && (dateElement.val() || hourElement.val() !== '00' || minuteElement.val() !== '00');
                };

                scope.onFocus = function () {
                    // Use safeApply to avoid apply error when Reset icon is clicked.
                    MaHelper.safeApply(function () {
                        scope.isFocused = true;
                    });
                };

                scope.onBlur = function () {
                    // Cancel change if it is already in process to prevent the event from firing twice.
                    if (changePromise) {
                        $timeout.cancel(changePromise);
                    }

                    scope.$apply(function () {
                        scope.isFocused = false;
                        changeDate();
                    });
                };

                scope.onKeydown = function (event) {
                    // Ignore tab key.
                    if (event.keyCode === MaHelper.keyCode.tab || event.keyCode === MaHelper.keyCode.shift) {
                        return;
                    }

                    keydownValue = angular.element(event.target).val();
                };

                scope.onKeyup = function (event) {
                    // Ignore tab key.
                    if (event.keyCode === MaHelper.keyCode.tab || event.keyCode === MaHelper.keyCode.shift) {
                        return;
                    }

                    var hasValueChanged = false;
                    keyupValue = angular.element(event.target).val();

                    if (keydownValue !== keyupValue) {
                        hasValueChanged = true;
                        scope.isTouched = true;
                        resetInitialDateOffset();
                    }

                    // Change value after a timeout while the user is typing.
                    if (hasValueChanged && changeTimeout > 0) {
                        dateCaretPosition = dateElement.prop('selectionStart');
                        hourCaretPosition = hourElement.prop('selectionStart');
                        minuteCaretPosition = minuteElement.prop('selectionStart');

                        if (changePromise) {
                            $timeout.cancel(changePromise);
                        }

                        changePromise = $timeout(function () {
                            changeDate();
                        }, changeTimeout);
                    }
                };

                scope.onTimeKeydown = function (event) {
                    if (
                        // Allow backspace, tab, delete.
                        $.inArray(event.keyCode, [MaHelper.keyCode.backspace, MaHelper.keyCode.tab, MaHelper.keyCode.delete]) !== -1 ||
                        // Allow left, right.
                        (event.keyCode === 37 || event.keyCode === 39)) {
                        return;
                    }

                    // Ensure that it is a number and stop the keypress.
                    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                };

                scope.onReset = function () {
                    if (scope.isDisabled) {
                        return;
                    }

                    previousDate = MaDate.createEmpty();
                    scope.isTouched = true;
                    validate(null);

                    triggerChange();
                    setDisplayDate(null);
                    dateElement.focus();
                };

                // Set initial date.
                if (scope.value) {
                    var date = parseDate(scope.value);

                    if (!date.isEmpty()) {
                        setDisplayDate(date);
                        previousDate = date;
                        initialDateOffset = date.offset();
                    }
                }

                addFocusEvent();
                addBlurEvent();

                $timeout(function () {
                    if (!scope.isDisabled) {
                        initializePikaday();
                    }

                    // Move id to input.
                    element.removeAttr('id');
                    dateElement.attr('id', scope.id);
                });

                scope.$watch('value', function (newDate, oldDate) {
                    if (newDate === null && oldDate === null) {
                        return;
                    }

                    var date = parseDate(newDate);

                    if (date.isEmpty()) {
                        previousDate = MaDate.createEmpty();
                        setDisplayDate(null);
                    }

                    if (!hasDateChanged(date)) {
                        setDisplayDate(date);
                        return;
                    }

                    // Validate date to make it valid in case it was invalid before or vice versa.
                    // Pass false as second parameter to avoid loop from triggering validate event.
                    validate(date, false);
                    setDisplayDate(date);
                    previousDate = date;
                    initialDateOffset = date.offset();
                });

                scope.$watch('isDisabled', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }

                    if (!scope.isDisabled) {
                        initializePikaday();
                    } else {
                        destroyPikaday();
                    }
                });

                var minMaxDateWatcher = function (newValue, oldValue, dateName) {
                    if (newValue === oldValue) {
                        return;
                    }

                    var date = parseDate(dateElement.val().trim());
                    date.offset(timeZoneOffset);

                    if (dateName === 'max') {
                        setMaxDate();
                    } else {
                        setMinDate();
                    }

                    setValidators();

                    // Run only min/max validators to avoid the component being highligthed as invalid
                    // by other validators like IsNotEmpty, when minDate/maxDate is changed.
                    var minMaxValidators = [];

                    for (var i = 0; i < validators.length; i++) {
                        if (validators[i].name === 'IsGreaterOrEqual' || validators[i].name === 'IsLessOrEqual') {
                            minMaxValidators.push(validators[i]);
                        }
                    }

                    if (minMaxValidators.length) {
                        var formattedDate = date.format(format);

                        // Empty failedValidator if it is min/max validator.
                        if (failedValidator && (failedValidator.name === 'IsGreaterOrEqual' || failedValidator.name === 'IsLessOrEqual')) {
                            failedValidator = null;
                            scope.isValid = true;
                        }

                        for (i = 0; i < minMaxValidators.length; i++) {
                            if (!minMaxValidators[i].validate(formattedDate)) {
                                scope.isValid = false;
                                failedValidator = minMaxValidators[i];
                                break;
                            }
                        }

                        if (!scope.isValid) {
                            scope.isTouched = true;
                        }

                        triggerValidate(date);
                    }

                    if (scope.isValid && hasDateChanged(date)) {
                        triggerChange(date);
                    }
                };

                scope.$watch('max', function (newValue, oldValue) {
                    minMaxDateWatcher(newValue, oldValue, 'max');
                });

                scope.$watch('min', function (newValue, oldValue) {
                    minMaxDateWatcher(newValue, oldValue, 'min');
                });

                scope.$watch('modifier', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }

                    setModifiers(oldValue);
                });

                scope.$watch('eventDates', function (newValue, oldValue) {
                    if (scope.isDisabled || angular.equals(newValue, oldValue)) {
                        return;
                    }

                    setEventDates();
                }, true);

                scope.$watch('disabledDates', function (newValue, oldValue) {
                    if (scope.isDisabled || angular.equals(newValue, oldValue)) {
                        return;
                    }

                    setValidators();

                    // Run only IsDisabled validator to avoid the component being highligthed as invalid
                    // by other validators like IsNotEmpty.
                    var validator;

                    for (var i = 0; i < validators.length; i++) {
                        if (validators[i].name === 'IsDisabled') {
                            validator = validators[i];
                        }
                    }

                    if (validator) {
                        var date = parseDate(dateElement.val().trim());
                        date.offset(timeZoneOffset);
                        var formattedDate = date.format(format);

                        if (failedValidator && failedValidator.name === validator.name) {
                            failedValidator = null;
                            scope.isValid = true;
                        }

                        if (!validator.validate(formattedDate)) {
                            scope.isValid = false;
                            failedValidator = validator;
                        }

                        if (!scope.isValid) {
                            scope.isTouched = true;
                        }

                        triggerValidate(date);
                    }
                }, true);

                setModifiers();
                setEventDates();

                // Prepare API instance.
                if (scope.instance) {
                    scope.instance.isInitialized = true;

                    scope.instance.isEditor = function () {
                        return true;
                    };

                    scope.instance.validate = function () {
                        scope.isTouched = true;

                        // Use display date, as scope date can't be invalid, because
                        // we don't update scope value when display date is invalid.
                        var date = getDisplayDate();

                        if (!date || (isRequired && date.isEmpty())) {
                            scope.isValid = false;
                            return;
                        }

                        // Prevent loop that might occur if validate method is invoked
                        // from validate event from outside.
                        validate(date, false);
                    };

                    scope.instance.isValid = function () {
                        return scope.isValid;
                    };

                    scope.instance.failedValidator = function () {
                        return failedValidator;
                    };

                    scope.instance.refresh = function () {
                        var date = parseDate(scope.value);
                        setDisplayDate(date);
                        validate(date, false);
                    };

                    // User typed value, that hasn't gone through validation.
                    scope.instance.rawValue = function (value) {
                        if (arguments.length === 1) {
                            dateElement.val(value);
                        } else {
                            return dateElement.val();
                        }
                    };
                }
            }
        };
    }]);