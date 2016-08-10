(function(){angular.module('marcuraUI.services', []);
angular.module('marcuraUI.components', ['marcuraUI.services']);
angular.module('marcuraUI', ['marcuraUI.components']);

// Detect IE9.
angular.element(document).ready(function() {
    var ie = (function() {
        var version = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');

        while (div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->', all[0]);

        return version > 4 ? version : null;
    }());

    if (ie) {
        var body = angular.element(document.getElementsByTagName('body')[0]);
        body.addClass('ma-ie' + ie);
    }
});
})();
(function(){angular.module('marcuraUI.components').directive('maButton', [function() {
    return {
        restrict: 'E',
        scope: {
            text: '@',
            kind: '@',
            leftIcon: '@',
            rightIcon: '@',
            isDisabled: '=',
            click: '&',
            size: '@',
            modifier: '@'
        },
        replace: true,
        template: function() {
            var html = '\
            <button class="ma-button{{cssClass}}"\
                ng-click="onClick()"\
                ng-disabled="isDisabled"\
                ng-class="{\
                    \'ma-button-link\': kind === \'link\',\
                    \'ma-button-has-left-icon\': hasLeftIcon,\
                    \'ma-button-has-right-icon\': hasRightIcon,\
                    \'ma-button-is-disabled\': isDisabled,\
                    \'ma-button-has-text\': hasText\
                }">\
                <span ng-if="leftIcon" class="ma-button-icon ma-button-icon-left">\
                    <i class="fa fa-{{leftIcon}}"></i>\
                </span><span class="ma-button-text">{{text || \'&nbsp;\'}}</span><span ng-if="rightIcon" class="ma-button-icon ma-button-icon-right">\
                    <i class="fa fa-{{rightIcon}}"></i>\
                </span>\
            </button>';

            return html;
        },
        link: function(scope) {
            scope.hasText = false;
            scope.hasLeftIcon = false;
            scope.hasRightIcon = false;
            scope.size = scope.size ? scope.size : 'md';
            scope.cssClass = ' ma-button-' + scope.size;
            scope.hasLeftIcon = scope.leftIcon ? true : false;
            scope.hasRightIcon = scope.rightIcon ? true : false;
            scope.hasText = scope.text ? true : false;

            if (scope.modifier) {
                scope.cssClass += ' ma-button-' + scope.modifier;
            }

            scope.onClick = function() {
                if (!scope.isDisabled) {
                    scope.click();
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maCheckBox', [function() {
    return {
        restrict: 'E',
        scope: {
            text: '@',
            value: '=',
            isDisabled: '=',
            change: '&',
            size: '@',
            rtl: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-check-box{{cssClass}}"\
                ng-click="onChange()"\
                ng-class="{\
                    \'ma-check-box-is-checked\': value === true,\
                    \'ma-check-box-is-disabled\': isDisabled,\
                    \'ma-check-box-has-text\': hasText,\
                    \'ma-check-box-rtl\': rtl\
                }">\
                <span class="ma-check-box-text">{{text || \'&nbsp;\'}}</span>\
                <div class="ma-check-box-inner"></div>\
                <i class="ma-check-box-icon fa fa-check" ng-show="value === true"></i>\
            </div>';

            return html;
        },
        link: function(scope) {
            scope._size = scope.size ? scope.size : 'xs';
            scope.cssClass = ' ma-check-box-' + scope._size;
            scope.hasText = scope.text ? true : false;

            scope.onChange = function() {
                if (!scope.isDisabled) {
                    scope.value = !scope.value;

                    scope.change({
                        value: scope.value
                    });
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maCostsGrid', [function() {
    return {
        restrict: 'E',
        scope: {
            costItems: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-grid ma-grid-costs"\
                costs grid\
            </div>';

            return html;
        },
        link: function(scope) {
            console.log('scope.costItems:', scope.costItems);
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maDateBox', ['$timeout', 'maDateConverter', 'maHelper', 'maValidators', function($timeout, maDateConverter, maHelper, maValidators) {
    return {
        restrict: 'E',
        scope: {
            id: '@',
            date: '=',
            timeZone: '=',
            culture: '=',
            isDisabled: '=',
            isRequired: '=',
            change: '&',
            isResettable: '=',
            displayFormat: '=',
            format: '=',
            hasTime: '=',
            parser: '=',
            validators: '=',
            instance: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-date-box" ng-class="{\
                    \'ma-date-box-has-time\': hasTime,\
                    \'ma-date-box-is-invalid\': !_isValid,\
                    \'ma-date-box-is-disabled\': isDisabled,\
                    \'ma-date-box-is-resettable\': _isResettable,\
                    \'ma-date-box-is-focused\': isFocused,\
                    \'ma-date-box-is-touched\': isTouched\
                }">\
                <input class="ma-date-box-date" type="text" id="{{id}}"\
                    ng-disabled="isDisabled"\
                    ng-focus="onFocus()"\
                    ng-keydown="onKeydown($event)"\
                    ng-keyup="onKeyup($event)"\
                    ng-blur="onBlur()"/><input class="ma-date-box-hours"\
                        maxlength="2"\
                        ng-disabled="isDisabled"\
                        ng-show="hasTime"\
                        ng-focus="onFocus()"\
                        ng-keydown="onKeydown($event)"\
                        ng-keyup="onKeyup($event)"\
                        ng-blur="onBlur()"\
                        ng-keydown="onTimeKeydown($event)"\
                        /><div class="ma-date-box-colon" ng-if="hasTime">:</div><input \
                        class="ma-date-box-minutes" type="text"\
                        maxlength="2"\
                        ng-disabled="isDisabled"\
                        ng-show="hasTime"\
                        ng-focus="onFocus()"\
                        ng-keydown="onKeydown($event)"\
                        ng-keyup="onKeyup($event)"\
                        ng-blur="onBlur()"\
                        ng-keydown="onTimeKeydown($event)"/>\
                <i class="ma-date-box-icon fa fa-calendar"></i>\
                <ma-reset-value\
                    is-disabled="!isResetEnabled()"\
                    click="onReset()"\
                    ng-show="_isResettable">\
                </ma-reset-value>\
            </div>';

            return html;
        },
        link: function(scope, element) {
            var picker = null,
                dateType = 'String',
                displayFormat = (scope.displayFormat ? scope.displayFormat : 'dd MMM yyyy').replace(/Y/g, 'y').replace(/D/g, 'd'),
                format = (scope.format ? scope.format : 'dd MMM yyyy').replace(/Y/g, 'y').replace(/D/g, 'd'),
                dateElement = angular.element(element[0].querySelector('.ma-date-box-date')),
                hoursElement = angular.element(element[0].querySelector('.ma-date-box-hours')),
                minutesElement = angular.element(element[0].querySelector('.ma-date-box-minutes')),
                previousDate = null,
                timeZone = scope.timeZone ? scope.timeZone.replace(/GMT/g, '') : 'Z',
                timeZoneOffset = moment().utcOffset(timeZone).utcOffset(),
                isDateSetInternally = true,
                initialDisplayDate,
                // Help track changes in date, hours or minutes.
                keydownValue,
                keyupValue,
                initialDateOffset = 0,
                validators = scope.validators ? angular.copy(scope.validators) : [],
                isRequired = scope.isRequired,
                hasIsNotEmptyValidator = false,
                onChange = function(internalDate) {
                    var date = null;

                    if (internalDate) {
                        date = moment(new Date());

                        date.year(internalDate.year())
                            .month(internalDate.month())
                            .date(internalDate.date())
                            .hours(internalDate.hours())
                            .minutes(internalDate.minutes())
                            .seconds(0);
                    }

                    scope.date = getDateInType(date);
                    scope.change({
                        date: scope.date
                    });
                },
                getDateInType = function(date) {
                    if (!date) {
                        return null;
                    } else if (dateType === 'Moment') {
                        return date;
                    } else {
                        return maDateConverter.format(date, format, timeZone);
                    }
                },
                hasDateChanged = function(date) {
                    if ((previousDate === null && date === null) || (previousDate && date && previousDate.diff(date) === 0)) {
                        return false;
                    }

                    scope.isTouched = true;

                    return true;
                },
                setDisplayDate = function(maDate, offset) {
                    var displayDate = null;

                    if (maDate && maDate.date) {
                        // Adjust time zone offset.
                        displayDate = maDateConverter.offsetUtc(maDate.date, timeZoneOffset - maDate.offset);
                        dateElement.val(maDateConverter.format(displayDate, displayFormat));
                        hoursElement.val(maDateConverter.format(displayDate, 'HH'));
                        minutesElement.val(maDateConverter.format(displayDate, 'mm'));

                        if (!initialDisplayDate) {
                            initialDisplayDate = dateElement.val();
                        }
                    } else {
                        dateElement.val('');
                        hoursElement.val('00');
                        minutesElement.val('00');
                    }

                    setCalendarDate(displayDate);
                },
                setCalendarDate = function(date) {
                    if (picker) {
                        isDateSetInternally = true;
                        picker.setDate(date ? date.toDate() : null);
                    }
                },
                parseDate = function(date) {
                    if (!date) {
                        return null;
                    }

                    var parsedDate = null;

                    if (scope.parser) {
                        parsedDate = scope.parser(date);
                    } else {
                        parsedDate = maDateConverter.parse(date, scope.culture);

                        if (!parsedDate) {
                            return null;
                        }
                    }

                    return {
                        date: moment(parsedDate.date),
                        offset: parsedDate.offset
                    };
                },
                addTimeToDate = function(date) {
                    var _date = moment(date);

                    return moment([_date.year(), _date.month(), _date.date(), Number(hoursElement.val()), Number(minutesElement.val()), 0]);
                },
                initializePikaday = function() {
                    picker = new Pikaday({
                        field: angular.element(element[0].querySelector('.ma-date-box-icon'))[0],
                        position: 'bottom right',
                        onSelect: function() {
                            // This is to prevent the event from firing when the date
                            // is set internally with setCalendarDate method.
                            if (isDateSetInternally) {
                                isDateSetInternally = false;
                                return;
                            }

                            var date = maDateConverter.offsetUtc(picker.getDate());

                            if (scope.hasTime) {
                                // Substruct time zone offset.
                                date = addTimeToDate(date);
                                date = maDateConverter.offsetUtc(date, -(timeZoneOffset - initialDateOffset));
                            }

                            if (!hasDateChanged(date)) {
                                return;
                            }

                            previousDate = date;

                            // Use $timeout to apply scope changes instead of $apply,
                            // which throws digest error at this point.
                            $timeout(function() {
                                onChange(date);
                            });
                        }
                    });

                    setCalendarDate(previousDate);
                },
                destroyPikaday = function() {
                    if (picker) {
                        picker.destroy();
                    }
                };

            // Set up validators.
            for (var i = 0; i < validators.length; i++) {
                if (validators[i].name === 'IsNotEmpty') {
                    hasIsNotEmptyValidator = true;
                    break;
                }
            }

            if (!hasIsNotEmptyValidator && isRequired) {
                validators.unshift(maValidators.isNotEmpty());
            }

            if (hasIsNotEmptyValidator) {
                isRequired = true;
            }

            scope._isResettable = scope.isResettable === false ? false : true;
            scope.isFocused = false;
            scope._isValid = true;
            scope.isTouched = false;

            scope.isResetEnabled = function() {
                return !scope.isDisabled && (dateElement.val() || hoursElement.val() !== '00' || minutesElement.val() !== '00');
            };

            scope.onFocus = function() {
                scope.isFocused = true;
            };

            scope.onBlur = function() {
                scope.isFocused = false;

                var date = dateElement.val().trim(),
                    isEmpty = date === '',
                    hours = Number(hoursElement.val()),
                    minutes = Number(minutesElement.val()),
                    maDate = {
                        date: null,
                        offset: 0
                    };

                // Check time.
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    maDate = parseDate(date) || maDate;
                    maDate.offset = initialDateOffset;
                } else {
                    scope._isValid = false;
                    return;
                }

                // Date is incorrect (has not been parsed) or is empty and touched.
                if ((!isEmpty && !maDate.date) || (isEmpty && scope.isTouched)) {
                    scope._isValid = false;
                    return;
                }

                if (maDate.date) {
                    if (scope.hasTime || (!scope.isTouched && initialDisplayDate === date)) {
                        // Substruct time zone offset.
                        maDate.date = addTimeToDate(maDate.date);
                        maDate.date = maDateConverter.offsetUtc(maDate.date, -(timeZoneOffset - initialDateOffset));
                    }
                }

                if (!hasDateChanged(maDate.date)) {
                    setDisplayDate(maDate);
                    scope._isValid = true;
                    return;
                }

                if (maDate.date) {
                    setDisplayDate(maDate);
                    previousDate = maDate.date;
                }

                // Run validators.
                if (validators && validators.length) {
                    scope._isValid = true;

                    for (var i = 0; i < validators.length; i++) {
                        if (!validators[i].method(maDate.date)) {
                            scope._isValid = false;
                            break;
                        }
                    }
                }

                if (!scope._isValid) {
                    return;
                }

                onChange(maDate.date);
            };

            scope.onKeydown = function(event) {
                // Ignore tab key.
                if (event.keyCode === maHelper.keyCode.tab || event.keyCode === maHelper.keyCode.shift) {
                    return;
                }

                keydownValue = angular.element(event.target).val();
            };

            scope.onKeyup = function(event) {
                // Ignore tab key.
                if (event.keyCode === maHelper.keyCode.tab || event.keyCode === maHelper.keyCode.shift) {
                    return;
                }

                keyupValue = angular.element(event.target).val();

                if (keydownValue !== keyupValue) {
                    scope.isTouched = true;

                    // Override initial time zone offset after date has been changed.
                    initialDateOffset = timeZoneOffset;
                }
            };

            scope.onTimeKeydown = function(event) {
                if (
                    // Allow backspace, tab, delete.
                    $.inArray(event.keyCode, [maHelper.keyCode.backspace, maHelper.keyCode.tab, maHelper.keyCode.delete]) !== -1 ||
                    // Allow left, right.
                    (event.keyCode === 37 || event.keyCode === 39)) {
                    return;
                }

                // Ensure that it is a number and stop the keypress.
                if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }
            };

            scope.onReset = function() {
                if (scope.isDisabled) {
                    return;
                }

                previousDate = null;

                if (isRequired) {
                    scope._isValid = false;
                    setDisplayDate();
                } else {
                    onChange();
                }
            };

            // Set initial date.
            if (scope.date) {
                // Determine initial date type.
                if (scope.date && scope.date.isValid && scope.date.isValid()) {
                    dateType = 'Moment';
                }

                var maDate = {
                    date: null,
                    offset: 0
                };

                if (dateType === 'String') {
                    maDate = maDateConverter.parse(scope.date, scope.culture) || maDate;
                }

                maDate.date = maDateConverter.offsetUtc(maDate.date);

                if (!maDate.date) {
                    return;
                }

                setDisplayDate(maDate);
                previousDate = maDate.date;
                initialDateOffset = maDate.offset;
            }

            $timeout(function() {
                if (!scope.isDisabled) {
                    initializePikaday();
                }

                // Move id to input.
                element.removeAttr('id');
                dateElement.attr('id', scope.id);
            });

            scope.$watch('date', function(newDate, oldDate) {
                if (newDate === null && oldDate === null) {
                    return;
                }

                var maDate = {
                    date: null,
                    offset: 0
                };

                maDate = parseDate(newDate) || maDate;

                if (maDate.date === null) {
                    previousDate = null;
                    setDisplayDate(null);
                }

                if (!hasDateChanged(maDate.date)) {
                    setDisplayDate(maDate);
                    return;
                }

                setDisplayDate(maDate);
                previousDate = maDate.date;
                initialDateOffset = maDate.offset;
            });

            scope.$watch('isDisabled', function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                if (!scope.isDisabled) {
                    initializePikaday();
                } else {
                    destroyPikaday();
                }
            });

            // Prepare API instance.
            if (scope.instance) {
                scope.instance.validate = function() {
                    scope.isTouched = true;

                    if (isRequired && !scope.date) {
                        scope._isValid = false;
                        return;
                    }

                    var maDate = parseDate(scope.date);

                    if (validators && validators.length) {
                        for (var i = 0; i < validators.length; i++) {
                            if (!validators[i].method(maDate)) {
                                scope._isValid = false;
                                break;
                            }
                        }
                    }
                };

                scope.instance.isValid = function() {
                    return scope._isValid;
                };
            }
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maGridOrder', [function() {
    return {
        restrict: 'E',
        scope: {
            orderBy: '@',
            orderedBy: '=',
            direction: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-grid-order ma-grid-order-{{direction}}"\
                ng-show="orderedBy === orderBy || (orderedBy === \'-\' + orderBy)">\
                <i class="fa fa-sort-{{direction}}"></i>\
            </div>';

            return html;
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maProgress', [function() {
    return {
        restrict: 'E',
        scope: {
            steps: '=',
            currentStep: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-progress">\
                <div class="ma-progress-inner">\
                    <div class="ma-progress-background"></div>\
                    <div class="ma-progress-bar" ng-style="{\
                        width: (calculateProgress() + \'%\')\
                    }">\
                    </div>\
                    <div class="ma-progress-steps">\
                        <div class="ma-progress-step"\
                            ng-style="{\
                                left: (calculateLeft($index) + \'%\')\
                            }"\
                            ng-repeat="step in steps"\
                            ng-class="{\
                                \'ma-progress-step-is-current\': isCurrentStep($index)\
                            }">\
                            <div class="ma-progress-text">{{$index + 1}}</div>\
                        </div>\
                    </div>\
                </div>\
                <div class="ma-progress-labels">\
                    <div ng-repeat="step in steps"\
                        class="ma-progress-label">\
                        {{step.text}}\
                    </div>\
                </div>\
            </div>';

            return html;
        },
        link: function(scope) {
            scope.calculateLeft = function(stepIndex) {
                return 100 / (scope.steps.length - 1) * stepIndex;
            };

            scope.calculateProgress = function() {
                if (!scope.currentStep) {
                    return 0;
                }

                if (scope.currentStep > scope.steps.length) {
                    return 100;
                }

                return 100 / (scope.steps.length - 1) * (scope.currentStep - 1);
            };

            scope.isCurrentStep = function(stepIndex) {
                return (stepIndex + 1) <= scope.currentStep;
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maRadioBox', [function() {
    return {
        restrict: 'E',
        scope: {
            text: '@',
            value: '=',
            selectedValue: '=',
            isDisabled: '=',
            change: '&',
            size: '@'
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-radio-box{{cssClass}}"\
                ng-click="onChange()"\
                ng-class="{\
                    \'ma-is-checked\': isChecked(),\
                    \'ma-radio-box-is-disabled\': isDisabled,\
                    \'ma-radio-box-has-text\': hasText,\
                }">\
                <span class="ma-radio-box-text">{{text || \'&nbsp;\'}}</span>\
                <div class="ma-radio-box-inner"></div>\
                <i class="ma-radio-box-icon" ng-show="isChecked()"></i>\
            </div>';

            return html;
        },
        link: function(scope) {
            scope._size = scope.size ? scope.size : 'xs';
            scope.cssClass = ' ma-radio-box-' + scope._size;
            scope.hasText = scope.text ? true : false;

            scope.onChange = function() {
                if (!scope.isDisabled) {
                    scope.selectedValue = scope.value;

                    scope.change({
                        value: scope.value
                    });
                }
            };

            scope.isChecked = function() {
                return JSON.stringify(scope.value) === JSON.stringify(scope.selectedValue);
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maResetValue', [function() {
    return {
        restrict: 'E',
        scope: {
            isDisabled: '=',
            click: '&'
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-reset-value" ng-class="{\
                    \'ma-reset-value-is-disabled\': isDisabled\
                }"\
                ng-click="onClick()">\
                <i class="fa fa-times"></i>\
            </div>';

            return html;
        },
        link: function(scope, element, attributes) {
            scope.onClick = function() {
                if (!scope.isDisabled) {
                    scope.click();
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.services').factory('maDateConverter', ['maHelper', function(maHelper) {
    var months = [{
            language: 'en',
            items: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }],
        daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var isMatch = function(date, substring) {
        return date.match(new RegExp(substring, 'i'));
    };

    var getTotalDate = function(year, month, day, hours, minutes, seconds, offset) {
        var finalMonth;
        day = day.toString();
        month = month.toString();
        hours = hours || 0;
        minutes = minutes || 0;
        seconds = seconds || 0;
        offset = offset || 0;

        // Convert YY to YYYY according to rules.
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
                for (var i = 0; i < months[j].items.length; i++) {
                    if (isMatch(month, months[j].items[i].slice(0, 3))) {
                        finalMonth = i + 1;
                        break;
                    }
                }
            }

            if (!finalMonth) {
                return null;
            }

            month = finalMonth;
        }

        if (month > 12) {
            return null;
        }

        if (day > daysPerMonth[month - 1]) {
            return null;
        }

        return {
            date: new Date(year, month - 1, day, hours, minutes, seconds),
            offset: offset
        };
    };

    var getDayAndMonth = function(day, month, culture) {
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

    var parse = function(value, culture) {
        var pattern, parts, dayAndMonth;

        if (value instanceof Date) {
            return value;
        }

        if (!angular.isString(value)) {
            return null;
        }

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
                return null;
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
                return null;
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
        // 2015-02-21T10:00:00+03:00
        pattern = /^(\d{4})(\/|-|\.|\s)(\d{1,2})(\/|-|\.|\s)(\d{1,2})T(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)(?:Z|([+-])(2[0-3]|[01][0-9]):([0-5][0-9]))$/;

        if (value.match(pattern) !== null) {
            parts = pattern.exec(value);
            var offset = 0;

            // Get time zone offset.
            if (parts.length === 12) {
                offset = (Number(parts[10]) || 0) * 60 + (Number(parts[11]) || 0);

                if (parts[9] === '-' && offset !== 0) {
                    offset = -offset;
                }
            }

            return getTotalDate(parts[1], parts[3], parts[5], parts[6], parts[7], parts[8], offset);
        }

        return null;
    };

    var format = function(date, format, timeZone) {
        var languageIndex = 0,
            isMomentDate = date && date.isValid && date.isValid();
        timeZone = timeZone || '';

        if (!maHelper.isDate(date) && !isMomentDate) {
            return null;
        }

        if (!angular.isString(format)) {
            return null;
        }

        // Possible formats of date parts (day, month, year).
        var datePartFormats = {
            s: ['ss'],
            m: ['mm'],
            H: ['HH'],
            d: ['d', 'dd'],
            M: ['M', 'MM', 'MMM', 'MMMM'],
            y: ['yy', 'yyyy'],
            Z: ['Z']
        };

        // Checks format string parts on conformity with available date formats.
        var checkDatePart = function(dateChar) {
            var datePart = '';

            // Try-catch construction because some sub-formats may be not listed.
            try {
                datePart = format.match(new RegExp(dateChar + '+', ''))[0];
            } catch (error) {}

            return datePartFormats[dateChar].indexOf(datePart);
        };

        var formatNumber = function(number, length) {
            var string = '';

            for (var i = 0; i < length; i++) {
                string += '0';
            }

            return (string + number).slice(-length);
        };

        var day = isMomentDate ? date.date() : date.getDate(),
            month = isMomentDate ? date.month() : date.getMonth(),
            year = isMomentDate ? date.year() : date.getFullYear(),
            hours = isMomentDate ? date.hours() : date.getHours(),
            minutes = isMomentDate ? date.minutes() : date.getMinutes(),
            seconds = isMomentDate ? date.seconds() : date.getSeconds();

        // Formats date parts.
        var formatDatePart = function(datePartFormat) {
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
                        datePart = months[languageIndex].items[month].substr(0, 3);
                        break;
                    }
                case datePartFormats.M[3]:
                    // MMMM
                    {
                        datePart = months[languageIndex].items[month];
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
            timeZone: formatDatePart(datePartFormats.Z[0]),
            separator: /^\w+([^\w])/.exec(format)
        };

        // Return formatted date string.
        return format
            .replace(/d+/, dateParts.days)
            .replace(/y+/, dateParts.years)
            .replace(/M+/, dateParts.months)
            .replace(/H+/, dateParts.hours)
            .replace(/m+/, dateParts.minutes)
            .replace(/s+/, dateParts.seconds)
            .replace(/Z+/, dateParts.timeZone);
    };

    var offsetUtc = function(date, timeZoneOffset) {
        if (!date) {
            return null;
        }

        timeZoneOffset = timeZoneOffset || 0;

        if (maHelper.isDate(date) || (date.isValid && date.isValid())) {
            return moment(date).add(timeZoneOffset, 'm');
        } else if (typeof date === 'string') {
            var _date = moment(date).minute(
                moment(date).minute() + (moment().utcOffset() * -1) + timeZoneOffset
            );

            return _date.isValid() ? _date : null;
        }
    };

    return {
        parse: parse,
        format: format,
        offsetUtc: offsetUtc
    };
}]);
})();
(function(){angular.module('marcuraUI.services').factory('maHelper', [function() {
    return {
        keyCode: {
            backspace: 8,
            comma: 188,
            delete: 46,
            down: 40,
            end: 35,
            enter: 13,
            escape: 27,
            home: 36,
            left: 37,
            pageDown: 34,
            pageUp: 33,
            period: 190,
            right: 39,
            shift: 16,
            space: 32,
            tab: 9,
            up: 38
        },

        isDate: function(value) {
            if (!value) {
                return false;
            }

            return Object.prototype.toString.call(value) === '[object Date]' && value.getTime && !isNaN(value.getTime());
        },

        isEmail: function(value) {
            var pattern = /^([\+\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return pattern.test(value);
        },

        isNullOrWhiteSpace: function(value) {
            if (value === null || value === undefined) {
                return true;
            }

            if (angular.isArray(value)) {
                return false;
            }

            // Convert value to string in case if it is not.
            return value.toString().replace(/\s/g, '').length < 1;
        },

        formatString: function(value) {
            // Source: http://ajaxcontroltoolkit.codeplex.com/SourceControl/latest#Client/MicrosoftAjax/Extensions/String.js
            var formattedString = '';

            for (var i = 0;;) {
                // Search for curly bracers.
                var open = value.indexOf('{', i);
                var close = value.indexOf('}', i);

                // Curly bracers are not found - copy rest of string and exit loop.
                if (open < 0 && close < 0) {
                    formattedString += value.slice(i);
                    break;
                }

                if (close > 0 && (close < open || open < 0)) {
                    // Closing brace before opening is error.
                    if (value.charAt(close + 1) !== '}') {
                        throw new Error('The format string contains an unmatched opening or closing brace.');
                    }

                    formattedString += value.slice(i, close + 1);
                    i = close + 2;
                    continue;
                }

                // Copy string before brace.
                formattedString += value.slice(i, open);
                i = open + 1;

                // Check for double braces (which display as one and are not arguments).
                if (value.charAt(i) === '{') {
                    formattedString += '{';
                    i++;
                    continue;
                }

                // At this point we have valid opening brace, which should be matched by closing brace.
                if (close < 0) {
                    throw new Error('The format string contains an unmatched opening or closing brace.');
                }

                // This test is just done to break a potential infinite loop for invalid format strings.
                // The code here is minimal because this is an error condition in debug mode anyway.
                if (close < 0) {
                    break;
                }

                // Find closing brace.
                // Get string between braces, and split it around ':' (if any).
                var brace = value.substring(i, close);
                var colonIndex = brace.indexOf(':');
                var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;

                if (isNaN(argNumber)) {
                    throw new Error('The format string is invalid.');
                }

                var arg = arguments[argNumber];

                if (typeof(arg) === 'undefined' || arg === null) {
                    arg = '';
                }

                formattedString += arg.toString();
                i = close + 1;
            }

            return formattedString;
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.services').factory('maValidators', ['maHelper', function(maHelper) {
    return {
        isNotEmpty: function() {
            return {
                name: 'IsNotEmpty',
                method: function(value) {
                    if (angular.isArray(value)) {
                        return value.length > 0;
                    }

                    return !maHelper.isNullOrWhiteSpace(value);
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maSideMenu', ['$state', function($state) {
    return {
        restrict: 'E',
        scope: {
            items: '=',
            select: '&',
            useState: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-side-menu">\
                <div class="ma-side-menu-item" ng-repeat="item in items" ng-class="{\
                        \'ma-side-menu-item-is-selected\': isItemSelected(item),\
                        \'ma-side-menu-item-is-disabled\': item.isDisabled\
                    }"\
                    ng-click="onSelect(item)">\
                    <i ng-if="item.icon" class="fa fa-{{item.icon}}"></i>\
                    <div class="ma-side-menu-text">{{item.text}}</div>\
                    <div class="ma-side-menu-new" ng-if="item.new">{{item.new}}</div>\
                </div>\
            </div>';

            return html;
        },
        link: function(scope, element, attributes) {
            scope.$state = $state;
            var useState = scope.useState === false ? false : true;

            scope.isItemSelected = function(item) {
                if (item.selector) {
                    return item.selector();
                }

                if (useState) {
                    if (item.state && item.state.name) {
                        return $state.includes(item.state.name);
                    }
                } else {
                    return item.isSelected;
                }

                return false;
            };

            scope.onSelect = function(item) {
                if (item.isDisabled) {
                    return;
                }

                if (useState) {
                    if (item.state && item.state.name) {
                        $state.go(item.state.name, item.state.parameters);
                    }
                } else {
                    angular.forEach(scope.items, function(item) {
                        item.isSelected = false;
                    });
                    item.isSelected = true;

                    scope.select({
                        item: item
                    });
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maTabs', ['$state', function($state) {
    return {
        restrict: 'E',
        scope: {
            items: '=',
            select: '&',
            useState: '='
        },
        replace: true,
        template: function() {
            var html = '\
            <div class="ma-tabs">\
                <ul class="ma-tabs-list clearfix">\
                    <li class="ma-tabs-item" ng-repeat="item in items" ng-class="{\
                            \'ma-tabs-item-is-selected\': isItemSelected(item),\
                            \'ma-tabs-item-is-disabled\': item.isDisabled\
                        }"\
                        ng-click="onSelect(item)">\
                        <a class="ma-tabs-link">\
                            <span class="ma-tabs-text">{{item.text}}</span>\
                        </a>\
                    </li>\
                </ul>\
            </div>';

            return html;
        },
        link: function(scope, element, attributes) {
            scope.$state = $state;
            var useState = scope.useState === false ? false : true;

            scope.isItemSelected = function(item) {
                if (item.selector) {
                    return item.selector();
                }

                if (useState) {
                    if (item.state && item.state.name) {
                        return $state.includes(item.state.name);
                    }
                } else {
                    return item.isSelected;
                }

                return false;
            };

            scope.onSelect = function(item) {
                if (item.isDisabled) {
                    return;
                }

                if (useState) {
                    if (item.state && item.state.name) {
                        $state.go(item.state.name, item.state.parameters);
                    }
                } else {
                    angular.forEach(scope.items, function(item) {
                        item.isSelected = false;
                    });
                    item.isSelected = true;

                    scope.select({
                        item: item
                    });
                }
            };
        }
    };
}]);
})();
(function(){angular.module('marcuraUI.components').directive('maTextBox', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            id: '@',
            value: '=',
            size: '=',
            change: '&',
            isDisabled: '='
        },
        replace: true,
        template: function($timeout) {
            var html = '\
            <div class="ma-text-box"\
                ng-class="{\
                    \'ma-text-box-is-disabled\': isDisabled\
                }">\
                <input class="ma-text-box-value form-control input-{{_size}}"\
                    ng-disabled="isDisabled"\
                    type="text"\
                    ng-model="value"/>\
            </div>';

            return html;
        },
        link: function(scope, element) {
            var valueElement = angular.element(element[0].querySelector('.ma-text-box-value'));
            // valueType,

            // getValueInType = function(value) {
            //     if (!value) {
            //         return null;
            //     } else if (dateType === 'String') {
            //         return value.toString();
            //     } else if (angular.isNumber(value)) {
            //         return date;
            //     } else {
            //         return maDateConverter.format(date, format);
            //     }
            // },
            // onChange = function (value) {
            //     scope.change({
            //         value: value
            //     });
            // };

            scope._size = scope.size ? scope.size : 'sm';

            $timeout(function() {
                // move id to input
                element.removeAttr('id');
                valueElement.attr('id', scope.id);
            });

            // scope.$watch('value', function(newValue, oldValue) {
            //     if (newValue === oldValue) {
            //         return;
            //     }
            //
            //     scope.change({
            //         value: value
            //     });
            // });


            // if (scope.value) {
            //     // determine initial value type
            //     if (maHelper.isString(scope.value)) {
            //         valueType = 'String';
            //     } else {
            //         valueType = 'Number';
            //     }
            //
            //     valueElement.val(scope.value);
            // }
        }
    };
}]);
})();