(function () {

    var api = ForgeWebComponents.Api;


    function PollResults() {
        this.pollQuestionText = null;
        this.answers = [];

    }

    function PollAnswer(EntityData, ShieldData) {
        this.answerText = EntityData.content;
        this.id = EntityData.id;
        this.numberVote = ShieldData.numberVote;
        this.votePercentage = Math.round(parseFloat(ShieldData.votePercentage) * 100);
    }

    Polymer({
        is: "poll-result",
        behaviors: [
            ForgeWebComponents.Behaviors.ForgeLocalizeBehavior
        ],
        properties: {
            value: {
                type: Object,
                value: new PollResults(),
                observer: '_valueChanged'
            },
            entity: {
                type: Object,
                observer: '_entityChanged'
            },
            moduleEnabled: {
                type: Boolean,
                value: false
            },
            _pollData: {
                type: Object,
                value: {}
            }
        },

        ready: function () {
            this._moduleEnabled = false;
            this._pollData = {};

            console.log(this.entity);
        },


        _getData: function (entityId) {

            var url = "deltatre.forge.wcm/api/customEntities/poll/working/culture/en-us/entityid/" + entityId;

            var self = this;
            self._hideLoading = false;

            api.raw(url).then(function (result) {
                self._hideLoading = true;
                self._pollData = result;
                self._pollResultLoad();
            }, function () {
                self._hideLoading = true;
                self._pollData = {};
                console.error(arguments);
            });

        },


        _valueChanged: function (newValue, oldValue) {
            if (!newValue) this.value = new PollResults();
        },

        _entityChanged: function (newValue, oldValue) {
            if (!newValue) {
                this.entity = {};
            } else {
                if (this.entity.entityId) {
                    this.debounce('triggerOnEntityChanged', this._triggerEntityChanged, 4000);
                }
            }
        },

        _triggerEntityChanged: function(){
            console.log("_triggerEntityChanged")
            this._moduleEnabled = false;
            this._pollData = {}
            this.value = new PollResults();

            this._getData(this.entity.entityId);
        },

        _pollResultLoad: function () {
            this.$.requestPollResult.generateRequest();
        },

        _pollResultResponse: function (data) {
            
            this.set('value.pollQuestionText', this._pollData.ExtendedFields.question);

            //this.value.pollQuestionText = this._pollData.Title;

            var pollAnswerList = this._pollData.ExtendedFields.answers;
            var pollShieldAnswerList = data.detail.response.pollResult;

            for (var i = 0; i < pollAnswerList.length; i++) {
                var answer = pollAnswerList[i];

                var answerVote = pollShieldAnswerList.find(function (s) {
                    if (s.answerKey === answer.id) {
                        return s;
                    }
                });

                var path = "value.answers";

                if(Boolean(answer.content))
                {
                    if (answerVote) {
                    
                        this.push(path, new PollAnswer(answer, answerVote))
                    
                    } else {
                        var emptyShieldData = {
                            numberVote: "0",
                            votePercentage: "0"
                        };

                        this.push(path, new PollAnswer(answer, emptyShieldData))
                    }
                }
            }

            this._moduleEnabled = true;

            console.log(this.value);


        },

        _refreshData: function () {
            this._moduleEnabled = false;
            this._pollData = {}
            this.value = new PollResults();
            this._getData(this.entity.entityId);
        },



    });



})();