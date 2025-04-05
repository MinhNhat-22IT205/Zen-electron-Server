export const enum socketEmit {
  sendMessage = 'sendMessage',
  seenMessage = 'seenMessage',
  activeList = 'activeList',

  //for webrtc
  callMessageFromPeer = 'callMessageFromPeer',
  memberLeft = 'memberLeft',
  stopLiveStream = 'stopLiveStream',
  userJoin = 'userJoin',
  addQuestion = 'addQuestion',
  questionChoice = 'questionChoice',
}
