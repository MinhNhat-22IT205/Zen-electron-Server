export const enum socketOn {
  sendMessage = 'sendMessage',
  endUserConnect = 'endUserConnect',

  //for webrtc
  callMessageFromPeer = 'callMessageFromPeer',
  memberLeft = 'memberLeft',
  stopLiveStream = 'stopLiveStream',
  userJoin = 'userJoin',
  addQuestion = 'addQuestion',
  questionChoice = 'questionChoice',
}
