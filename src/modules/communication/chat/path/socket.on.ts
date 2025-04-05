export const enum socketOn {
  joinConversation = 'joinConversation',
  sendMessage = 'sendMessage',
  sendFile = 'sendFile',
  deleteMessage = 'deleteMessage',
  endUserConnect = 'endUserConnect',
  seenMessage = 'seenMessage',
  activeList = 'activeList',

  //for call
  requestCall = 'requestCall',
  requestCancel = 'requestCancel',
  requestDeny = 'requestDeny',
  requestAccept = 'requestAccept',
  memberLeft = 'memberLeft',
  callMessageFromPeer = 'callMessageFromPeer',
}
