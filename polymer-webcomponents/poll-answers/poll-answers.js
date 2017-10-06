(function () {

    const answerType = "text";

    function Answer(answerType) {
        this.type = answerType;
        this.content = null;
        this.id = uuid.v4()
    };

    Polymer({
        is: "poll-answers",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            value: {
                type: Array,
                value: [],
                observer: '_valueChanged'
            },
            _showAddButton: {
                type: Boolean,
                value: true
            }
        },

        ready: function () {
            this._linkToContentType = false;
            this._externalLinkType = false;

        },

        _valueChanged: function (newValue, oldValue) {
            if (!newValue) this.value = [];
        },

        _addAnswer: function (e, answer) {

            var path = "value";
            var positionLength = this.value.length;
            this._showAddButton = true;

            if (positionLength == 0) {
                this.push(path, new Answer(answerType));
                this._callValueChanged(0);
            }
            else {
                if (positionLength <= 9) {
                    if (Boolean(this.value[positionLength - 1].content)) {
                        var lastPositionInsert = this.value[positionLength - 1];
                        if (positionLength != 9) {
                            if (lastPositionInsert.content) {
                                this.push(path, new Answer(answerType));
                                this._callValueChanged(0);
                            } else {
                                toastWarningPoll.open();
                                return;
                            }
                        } else {

                            this.push(path, new Answer(answerType));
                            this._callValueChanged(0);
                            this._showAddButton = false;
                        }
                    }
                    else {
                        toastWarningPoll.open();
                        return;
                    }
                } else {
                    this._showAddButton = false;
                }
            }
        },

        _onAnswerInput: function () {
            this._callValueChanged(500);
        },

        _onAnswerChange: function () {
            this._callValueChanged(0);
        },

        _deleteAnswer: function (e) {
            var path = "value";
            var _index = e.model.dataHost.answerIndex;

            this.splice(path, _index, 1);
            this._callValueChanged(0);

            if (this.value.length < 10) {
                this._showAddButton = true;
            }
        },

        _isTextAnswer: function (answer, indexAnswer) {
            if (indexAnswer >= 9) {
                this._showAddButton = false;
            }

            return answer.type === "text" ? true : false;
        },

        _callValueChanged: function (mills) {
            this.debounce('triggerOnValueChanged', this._triggerValueChanged, mills);
        },

        _triggerValueChanged: function () {
            this.fire('valueChanged', this.value);
        }
    });
})();