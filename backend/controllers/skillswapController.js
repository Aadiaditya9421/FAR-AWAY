import {
  acceptSkillSwapRequest,
  cancelSkillSwapRequest,
  completeSkillSwapRequest,
  createSkillSwapRequest,
  declineSkillSwapRequest,
  listSkillSwapRequests,
  recommendSkillSwapPeers,
  sendSkillSwapMessage,
  updateSkillSwapMeetingUrl,
} from "../services/skillswapService.js";
import { notifyUser } from "../sockets/notificationSocket.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

function userId(value) {
  if (!value) return "";
  return value._id?.toString?.() || value.toString();
}

function userName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.email || "A student";
}

function notifySkillSwap(user, payload) {
  const id = userId(user);
  if (!id) return;
  notifyUser(id, {
    category: "skillswap",
    requestId: payload.requestId,
    createdAt: new Date().toISOString(),
    ...payload,
  });
}

function notifyCounterpart(request, actorId, payload) {
  const requesterId = userId(request.requester);
  const receiverId = userId(request.receiver);
  const actor = userId(actorId);
  const targetId = requesterId === actor ? receiverId : requesterId;
  notifySkillSwap(targetId, payload);
}

export async function getRequests(req, res) {
  const { items, meta } = await listSkillSwapRequests(req.user._id, req.query);
  return sendSuccess(res, { message: "SkillSwap requests retrieved", data: items, meta });
}

export async function getRecommendedPeers(req, res) {
  const items = await recommendSkillSwapPeers(req.user._id, req.query);
  return sendSuccess(res, { message: "Recommended SkillSwap peers retrieved", data: items });
}

export async function postRequest(req, res) {
  const request = await createSkillSwapRequest(req.user._id, req.body);
  const actor = userName(req.user);
  const requestId = request._id.toString();

  if (request.receiver) {
    notifySkillSwap(request.receiver, {
      title: "New SkillSwap request",
      message: `${actor} sent you a SkillSwap request.`,
      type: "info",
      action: "requested",
      requestId,
    });
    notifySkillSwap(request.requester, {
      title: "SkillSwap request sent",
      message: "Your SkillSwap request is pending.",
      type: "success",
      action: "requested",
      requestId,
    });
  } else {
    notifySkillSwap(request.requester, {
      title: "SkillSwap posted",
      message: "Your SkillSwap post is live for other students.",
      type: "success",
      action: "posted",
      requestId,
    });
  }

  return sendCreated(res, { message: "SkillSwap request created", data: request });
}

export async function acceptRequest(req, res) {
  const request = await acceptSkillSwapRequest(req.params.id, req.user._id);
  const actor = userName(req.user);
  const requestId = request._id.toString();
  notifyCounterpart(request, req.user._id, {
    title: "SkillSwap accepted",
    message: `${actor} accepted your SkillSwap request.`,
    type: "success",
    action: "accepted",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "SkillSwap accepted",
    message: "SkillSwap is now connected.",
    type: "success",
    action: "accepted",
    requestId,
  });
  return sendSuccess(res, { message: "SkillSwap request accepted", data: request });
}

export async function declineRequest(req, res) {
  const request = await declineSkillSwapRequest(req.params.id, req.user._id);
  const actor = userName(req.user);
  const requestId = request._id.toString();
  notifyCounterpart(request, req.user._id, {
    title: "SkillSwap declined",
    message: `${actor} declined the SkillSwap request.`,
    type: "warning",
    action: "declined",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "SkillSwap declined",
    message: "The SkillSwap request was declined.",
    type: "warning",
    action: "declined",
    requestId,
  });
  return sendSuccess(res, { message: "SkillSwap request declined", data: request });
}

export async function cancelRequest(req, res) {
  const request = await cancelSkillSwapRequest(req.params.id, req.user._id);
  const actor = userName(req.user);
  const requestId = request._id.toString();
  notifyCounterpart(request, req.user._id, {
    title: "SkillSwap cancelled",
    message: `${actor} cancelled the SkillSwap request.`,
    type: "warning",
    action: "cancelled",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "SkillSwap cancelled",
    message: "Your SkillSwap request was cancelled.",
    type: "warning",
    action: "cancelled",
    requestId,
  });
  return sendSuccess(res, { message: "SkillSwap request cancelled", data: request });
}

export async function completeRequest(req, res) {
  const request = await completeSkillSwapRequest(req.params.id, req.user._id);
  const actor = userName(req.user);
  const requestId = request._id.toString();
  notifyCounterpart(request, req.user._id, {
    title: "SkillSwap completed",
    message: `${actor} marked your SkillSwap as completed.`,
    type: "success",
    action: "completed",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "SkillSwap completed",
    message: "SkillSwap marked as completed.",
    type: "success",
    action: "completed",
    requestId,
  });
  return sendSuccess(res, { message: "SkillSwap request completed", data: request });
}

export async function sendMessage(req, res) {
  const request = await sendSkillSwapMessage(req.params.id, req.user._id, req.body.message);
  const actor = userName(req.user);
  const requestId = request._id.toString();

  notifyCounterpart(request, req.user._id, {
    title: "New SkillSwap message",
    message: `${actor} sent a message in your SkillSwap chat.`,
    type: "info",
    action: "message",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "Message sent",
    message: "Your SkillSwap message was sent.",
    type: "success",
    action: "message",
    requestId,
  });

  return sendSuccess(res, { message: "SkillSwap message sent", data: request });
}

export async function updateMeeting(req, res) {
  const request = await updateSkillSwapMeetingUrl(req.params.id, req.user._id, req.body.meetingUrl);
  const actor = userName(req.user);
  const requestId = request._id.toString();

  notifyCounterpart(request, req.user._id, {
    title: "Google Meet link updated",
    message: `${actor} added a Google Meet link to your SkillSwap.`,
    type: "info",
    action: "meeting",
    requestId,
  });
  notifySkillSwap(req.user._id, {
    title: "Meet link saved",
    message: "Google Meet link saved for this SkillSwap.",
    type: "success",
    action: "meeting",
    requestId,
  });

  return sendSuccess(res, { message: "SkillSwap meeting link updated", data: request });
}
