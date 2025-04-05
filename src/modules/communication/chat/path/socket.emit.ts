export const enum socketEmit {
  sendMessage = 'sendMessage',
  seenMessage = 'seenMessage',
  activeList = 'activeList',

  //for call
  requestCancel = 'requestCancel',
  requestDeny = 'requestDeny',
  requestAccept = 'requestAccept',
  callMessageFromPeer = 'callMessageFromPeer',
  memberLeft = 'memberLeft',
}
