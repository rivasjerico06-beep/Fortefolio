import { notFound } from "next/navigation";
import { getConversation } from "../../data";
import { Thread } from "./thread";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: Params) {
  const { id } = await params;
  const conversation = await getConversation(id);

  /* One 404 for three different situations: no such conversation, someone
     else's conversation, and signed out. That is on purpose — telling an
     uninvited caller "this exists but is not yours" leaks that it exists, and
     the thread ids are guessable enough to be worth probing. The database
     already returns nothing in all three cases; this just does not embellish. */
  if (!conversation) notFound();

  return (
    <Thread conversationId={id} other={conversation.other} messages={conversation.messages} />
  );
}
