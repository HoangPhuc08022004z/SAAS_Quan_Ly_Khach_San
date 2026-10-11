// FR: FR-O47, FR-O48, FR-O49
// Service: api.askStaffBot, api.getChatSuggestions, api.sendChatFeedback

import { StaffChatPage } from "@/features/chat/components/StaffChatPage";

export const dynamic = "force-dynamic";

export default function PmsChatRoutePage() {
  return <StaffChatPage />;
}
