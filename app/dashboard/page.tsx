import { getServerSession } from "next-auth";
import { prismaClient } from "../lib/db";
import { NextResponse } from "next/server";
import StreamView from "../components/StreamView";


export default async function Component() {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
      where: {
          email: session?.user?.email ?? ""
      }
  });

  if(!user) {
      return NextResponse.json({
          message: "Unauthenticated"
      }, {
          status: 403
      })
  }

  return <StreamView creatorId={user.id} playingVideo={true}/>
}