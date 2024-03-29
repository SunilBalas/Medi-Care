function SingleConvState(input) {
    return this.input = input, this.answer = "", this.next = !1, this
}

function ConvState(wrapper, SingleConvState, form, params, originalFormHtml) {
    this.form = form, this.wrapper = wrapper, this.current = SingleConvState, this.answers = {}, this.parameters = params, this.originalFormHtml = originalFormHtml, this.scrollDown = function () {
        $(this.wrapper).find("#messages").stop().animate({
            scrollTop: $(this.wrapper).find("#messages")[0].scrollHeight
        }, 600)
    }.bind(this)
}
SingleConvState.prototype.hasNext = function () {
    return this.next
}, ConvState.prototype.destroy = function () {
    return !!this.originalFormHtml && ($(this.wrapper).html(this.originalFormHtml), !0)
}, ConvState.prototype.newState = function (options) {
    var input = $.extend(!0, {}, {
        name: "",
        noAnswer: !1,
        required: !0,
        questions: ["You forgot the question!"],
        type: "text",
        multiple: !1,
        selected: "",
        answers: []
    }, options);
    return input.element = $('<input type="text" name="' + input.name + '"/>'), new SingleConvState(input)
}, ConvState.prototype.next = function () {
    if (this.current.hasNext()) {
        if (this.current = this.current.next, this.current.input.hasOwnProperty("fork") && this.current.input.hasOwnProperty("case")) {
            if (this.answers.hasOwnProperty(this.current.input.fork) && this.answers[this.current.input.fork].value != this.current.input.case) return this.next();
            if (!this.answers.hasOwnProperty(this.current.input.fork)) return this.next()
        }
        return !0
    }
    return !1
}, ConvState.prototype.printQuestion = function () {
    var questions = this.current.input.questions,
        question = questions[Math.floor(Math.random() * questions.length)],
        ansWithin = question.match(/\{(.*?)\}(\:(\d)*)?/g);
    for (var key in ansWithin)
        if (ansWithin.hasOwnProperty(key)) {
            var ansKey = ansWithin[key].replace(/\{|\}/g, ""),
                ansFinalKey = ansKey,
                index = !1;
            if (-1 != ansKey.indexOf(":") && (ansFinalKey = ansFinalKey.split(":")[0], index = ansKey.split(":")[1]), !1 !== index) {
                var replacement = this.answers[ansFinalKey].text.split(" ");
                question = replacement.length >= index ? question.replace(ansWithin[key], replacement[index]) : question.replace(ansWithin[key], this.answers[ansFinalKey].text)
            } else question = question.replace(ansWithin[key], this.answers[ansFinalKey].text)
        } var messageObj = $(this.wrapper).find(".message.typing");
    setTimeout(function () {
        messageObj.html(question), messageObj.removeClass("typing").addClass("ready"), "select" == this.current.input.type && this.printAnswers(this.current.input.answers, this.current.input.multiple), this.scrollDown(), this.current.input.hasOwnProperty("noAnswer") && !0 === this.current.input.noAnswer && (this.next() ? setTimeout(function () {
            var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
            $(this.wrapper).find("#messages").append(messageObj), this.scrollDown(), this.printQuestion()
        }.bind(this), 200) : this.parameters.eventList.onSubmitForm(this)), $(this.wrapper).find(this.parameters.inputIdHashTagName).focus()
    }.bind(this), 500)
}, ConvState.prototype.printAnswers = function (answers, multiple) {
    var opened = !1;
    if (0 != this.wrapper.find("div.options").height() && (opened = !0), this.wrapper.find("div.options div.option").remove(), multiple) {
        for (var i in answers)
            if (answers.hasOwnProperty(i)) {
                var option = $('<div class="option">' + answers[i].text + "</div>").data("answer", answers[i]).click(function (event) {
                    Array.isArray(this.current.input.selected) || (this.current.input.selected = []);
                    var indexOf = this.current.input.selected.indexOf($(event.target).data("answer").value); - 1 == indexOf ? (this.current.input.selected.push($(event.target).data("answer").value), $(event.target).addClass("selected")) : (this.current.input.selected.splice(indexOf, 1), $(event.target).removeClass("selected")), this.wrapper.find(this.parameters.inputIdHashTagName).removeClass("error"), this.wrapper.find(this.parameters.inputIdHashTagName).val(""), this.current.input.selected.length > 0 ? this.wrapper.find("button.submit").addClass("glow") : this.wrapper.find("button.submit").removeClass("glow")
                }.bind(this));
                this.wrapper.find("div.options").append(option), $(window).trigger("dragreset")
            }
    } else
        for (var i in answers)
            if (answers.hasOwnProperty(i)) {
                var option = $('<div class="option">' + answers[i].text + "</div>").data("answer", answers[i]).click(function (event) {
                    this.current.input.selected = $(event.target).data("answer").value, this.wrapper.find(this.parameters.inputIdHashTagName).removeClass("error"), this.wrapper.find(this.parameters.inputIdHashTagName).val(""), this.answerWith($(event.target).data("answer").text, $(event.target).data("answer")), this.wrapper.find("div.options div.option").remove()
                }.bind(this));
                this.wrapper.find("div.options").append(option), $(window).trigger("dragreset")
            } if (!opened) {
                var diff = $(this.wrapper).find("div.options").height(),
                    originalHeight = $(this.wrapper).find(".wrapper-messages").height();
                $(this.wrapper).find(".wrapper-messages").data("originalHeight", originalHeight), $(this.wrapper).find(".wrapper-messages").css({
                    marginBottom: diff,
                    maxHeight: originalHeight - diff
                })
            }
}, ConvState.prototype.answerWith = function (answerText, answerObject) {
    this.current.input.hasOwnProperty("name") && ("string" == typeof answerObject ? ("tel" == this.current.input.type && (answerObject = answerObject.replace(/\s|\(|\)|-/g, "")), this.answers[this.current.input.name] = {
        text: answerText,
        value: answerObject
    }, this.current.answer = {
        text: answerText,
        value: answerObject
    }) : (this.answers[this.current.input.name] = answerObject, this.current.answer = answerObject), "select" != this.current.input.type || this.current.input.multiple ? $(this.current.input.element).val(answerObject).change() : $(this.current.input.element).val(answerObject.value).change()), "password" == this.current.input.type && (answerText = answerText.replace(/./g, "*"));
    var message = $('<div class="message from">' + answerText + "</div>");
    $(this.wrapper).find("div.options div.option").remove();
    var diff = $(this.wrapper).find("div.options").height(),
        originalHeight = $(this.wrapper).find(".wrapper-messages").data("originalHeight");
    $(this.wrapper).find(".wrapper-messages").css({
        marginBottom: diff,
        maxHeight: originalHeight
    }), $(this.wrapper).find(this.parameters.inputIdHashTagName).focus(), answerObject.hasOwnProperty("callback") && (this.current.input.callback = answerObject.callback), setTimeout(function () {
        $(this.wrapper).find("#messages").append(message), this.scrollDown()
    }.bind(this), 100), $(this.form).append(this.current.input.element);
    var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
    setTimeout(function () {
        $(this.wrapper).find("#messages").append(messageObj), this.scrollDown()
    }.bind(this), 150), this.parameters.eventList.onInputSubmit(this, function () {
        this.next() ? setTimeout(function () {
            this.printQuestion()
        }.bind(this), 300) : this.parameters.eventList.onSubmitForm(this)
    }.bind(this))
},
    function ($) {
        $.fn.convform = function (options) {
            var wrapper = this,
                originalFormHtml = $(this).html();
            $(this).addClass("conv-form-wrapper");
            var parameters = $.extend(!0, {}, {
                placeHolder: "Type Here",
                typeInputUi: "textarea",
                timeOutFirstQuestion: 1200,
                buttonClassStyle: "icon2-arrow",
                eventList: {
                    onSubmitForm: function (convState) {
                        return console.log("completed"), convState.form.submit(), !0
                    },
                    onInputSubmit: function (convState, readyCallback) {
                        convState.current.input.hasOwnProperty("callback") ? "string" == typeof convState.current.input.callback ? window[convState.current.input.callback](convState, readyCallback) : convState.current.input.callback(convState, readyCallback) : readyCallback()
                    }
                },
                formIdName: "convForm",
                inputIdName: "userInput",
                loadSpinnerVisible: "",
                buttonText: "▶"
            }, options),
                inputs = $(this).find("input, select, textarea").map(function () {
                    var input = {};
                    return $(this).attr("name") && (input.name = $(this).attr("name")), $(this).attr("data-no-answer") && (input.noAnswer = !0), $(this).attr("required") && (input.required = !0), $(this).attr("type") && (input.type = $(this).attr("type")), input.questions = $(this).attr("data-conv-question").split("|"), $(this).attr("data-pattern") && (input.pattern = $(this).attr("data-pattern")), $(this).attr("data-callback") && (input.callback = $(this).attr("data-callback")), $(this).is("select") && (input.type = "select", input.answers = $(this).find("option").map(function () {
                        var answer = {};
                        return answer.text = $(this).text(), answer.value = $(this).val(), $(this).attr("data-callback") && (answer.callback = $(this).attr("data-callback")), answer
                    }).get(), $(this).prop("multiple") ? (input.multiple = !0, input.selected = []) : (input.multiple = !1, input.selected = "")), $(this).parent("div[data-conv-case]").length && (input.case = $(this).parent("div[data-conv-case]").attr("data-conv-case"), input.fork = $(this).parent("div[data-conv-case]").parent("div[data-conv-fork]").attr("data-conv-fork")), input.element = this, $(this).detach(), input
                }).get();
            if (inputs.length) {
                var form = $(this).find("form").hide(),
                    inputForm;
                switch (parameters.inputIdHashTagName = "#" + parameters.inputIdName, parameters.typeInputUi) {
                    case "input":
                        inputForm = $('<form id="' + parameters.formIdName + '" class="convFormDynamic"><input type="hidden" value="'+ $("#symptoms_data").val() +'" name="OurData"/><div class="options dragscroll"></div><input id="' + parameters.inputIdName + '" type="text" placeholder="' + parameters.placeHolder + '" class="userInputDynamic"></><button type="submit" class="submit">' + parameters.buttonText + '</button><span class="clear"></span></form>');
                        break;
                    case "textarea":
                        inputForm = $('<form id="' + parameters.formIdName + '" class="convFormDynamic"><input type="hidden" value="'+ $("#symptoms_data").val() +'" name="OurData"/><div class="options dragscroll"></div><textarea id="' + parameters.inputIdName + '" rows="1" placeholder="' + parameters.placeHolder + '" class="userInputDynamic"></textarea><button type="submit" class="submit">' + parameters.buttonText + '</button><span class="clear"></span></form>');
                        break;
                    default:
                        return console.log("typeInputUi must be input or textarea"), !1
                }
                $(this).append('<div class="wrapper-messages"><div class="spinLoader ' + parameters.loadSpinnerVisible + ' "></div><div id="messages"></div></div>'), $(this).append(inputForm);
                var singleState = new SingleConvState(inputs[0]),
                    state = new ConvState(this, singleState, form, parameters, originalFormHtml);
                for (var i in inputs) 0 != i && inputs.hasOwnProperty(i) && (singleState.next = new SingleConvState(inputs[i]), singleState = singleState.next);
                return setTimeout(function () {
                    $.when($("div.spinLoader").addClass("hidden")).done(function () {
                        var messageObj = $('<div class="message to typing"><div class="typing_loader"></div></div>');
                        $(state.wrapper).find("#messages").append(messageObj), state.scrollDown(), state.printQuestion()
                    })
                }, parameters.timeOutFirstQuestion), $(inputForm).find(parameters.inputIdHashTagName).keypress(function (e) {
                    if (13 == e.which) {
                        var input = $(this).val(),
                            results;
                        if (e.preventDefault(), "select" != state.current.input.type || state.current.input.multiple)
                            if ("select" == state.current.input.type && state.current.input.multiple) {
                                var results;
                                if ("" != input.trim()) (results = state.current.input.answers.filter(function (el) {
                                    return -1 != el.text.toLowerCase().indexOf(input.toLowerCase())
                                })).length ? -1 == state.current.input.selected.indexOf(results[0].value) ? (state.current.input.selected.push(results[0].value), state.wrapper.find(parameters.inputIdHashTagName).val("")) : state.wrapper.find(parameters.inputIdHashTagName).val("") : state.wrapper.find(parameters.inputIdHashTagName).addClass("error");
                                else state.current.input.selected.length && $(this).parent("form").submit()
                            } else "" == input.trim() || state.wrapper.find(parameters.inputIdHashTagName).hasClass("error") ? $(state.wrapper).find(parameters.inputIdHashTagName).focus() : $(this).parent("form").submit();
                        else if (state.current.input.required) state.wrapper.find("#userInputBot").addClass("error");
                        else (results = state.current.input.answers.filter(function (el) {
                            return -1 != el.text.toLowerCase().indexOf(input.toLowerCase())
                        })).length ? (state.current.input.selected = results[0], $(this).parent("form").submit()) : state.wrapper.find(parameters.inputIdHashTagName).addClass("error")
                    }
                    autosize.update($(state.wrapper).find(parameters.inputIdHashTagName))
                }).on("input", function (e) {
                    if ("select" == state.current.input.type) {
                        var input = $(this).val(),
                            results = state.current.input.answers.filter(function (el) {
                                return -1 != el.text.toLowerCase().indexOf(input.toLowerCase())
                            });
                        results.length ? (state.wrapper.find(parameters.inputIdHashTagName).removeClass("error"), state.printAnswers(results, state.current.input.multiple)) : state.wrapper.find(parameters.inputIdHashTagName).addClass("error")
                    } else if (state.current.input.hasOwnProperty("pattern")) {
                        var reg;
                        new RegExp(state.current.input.pattern, "i").test($(this).val()) ? state.wrapper.find(parameters.inputIdHashTagName).removeClass("error") : state.wrapper.find(parameters.inputIdHashTagName).addClass("error")
                    }
                }), $(inputForm).find("button.submit").click(function (e) {
                    var input = $(state.wrapper).find(parameters.inputIdHashTagName).val();
                    if (e.preventDefault(), "select" != state.current.input.type || state.current.input.multiple)
                        if ("select" == state.current.input.type && state.current.input.multiple) {
                            if (state.current.input.required && 0 === state.current.input.selected.length) return !1;
                            var results;
                            "" != input.trim() && input != parameters.placeHolder ? (results = state.current.input.answers.filter(function (el) {
                                return -1 != el.text.toLowerCase().indexOf(input.toLowerCase())
                            })).length ? -1 == state.current.input.selected.indexOf(results[0].value) ? (state.current.input.selected.push(results[0].value), state.wrapper.find(parameters.inputIdHashTagName).val("")) : state.wrapper.find(parameters.inputIdHashTagName).val("") : state.wrapper.find(parameters.inputIdHashTagName).addClass("error") : state.current.input.selected.length && ($(this).removeClass("glow"), $(this).parent("form").submit())
                        } else "" == input.trim() || state.wrapper.find(parameters.inputIdHashTagName).hasClass("error") ? $(state.wrapper).find(parameters.inputIdHashTagName).focus() : $(this).parent("form").submit();
                    else {
                        if (state.current.input.required && !state.current.input.selected) return !1;
                        var results;
                        input == parameters.placeHolder && (input = ""), (results = state.current.input.answers.filter(function (el) {
                            return -1 != el.text.toLowerCase().indexOf(input.toLowerCase())
                        })).length ? (state.current.input.selected = results[0], $(this).parent("form").submit()) : state.wrapper.find(parameters.inputIdHashTagName).addClass("error")
                    }
                    autosize.update($(state.wrapper).find(parameters.inputIdHashTagName))
                }), $(inputForm).submit(function (e) {
                    e.preventDefault();
                    var answer = $(this).find(parameters.inputIdHashTagName).val();
                    $(this).find(parameters.inputIdHashTagName).val(""), "select" == state.current.input.type ? state.current.input.multiple ? state.answerWith(state.current.input.selected.join(", "), state.current.input.selected) : state.answerWith(state.current.input.selected.text, state.current.input.selected) : state.answerWith(answer, answer)
                }), "function" == typeof autosize && ($textarea = $(state.wrapper).find(parameters.inputIdHashTagName), autosize($textarea)), state
            }
            return !1
        }
    }(jQuery);