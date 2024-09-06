import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";
import { stringify } from "querystring";
import { YT_REGEX } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

const createStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = createStreamSchema.parse(await req.json());
    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json(
        {
          message: "Wrong URL format",
        },
        {
          status: 411,
        }
      );
    }

    const extractedId = data.url.split("?v=")[1];
    const res = await youtubesearchapi.GetVideoDetails(extractedId);
    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res.title ?? "Can't find Video",
        artist: res.channel ?? "Unknown Artist",
        smallImage:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url ??
              "https://media.istockphoto.com/id/1361394182/photo/funny-british-shorthair-cat-portrait-looking-shocked-or-surprised.jpg?s=612x612&w=0&k=20&c=6yvVxdufrNvkmc50nCLCd8OFGhoJd6vPTNotl90L-vo="
            : thumbnails[thumbnails.length - 1].url ??
              "https://media.istockphoto.com/id/1361394182/photo/funny-british-shorthair-cat-portrait-looking-shocked-or-surprised.jpg?s=612x612&w=0&k=20&c=6yvVxdufrNvkmc50nCLCd8OFGhoJd6vPTNotl90L-vo=",
        largeImage:
          thumbnails[thumbnails.length - 1].url ??
          "https://media.istockphoto.com/id/1361394182/photo/funny-british-shorthair-cat-portrait-looking-shocked-or-surprised.jpg?s=612x612&w=0&k=20&c=6yvVxdufrNvkmc50nCLCd8OFGhoJd6vPTNotl90L-vo=",
      },
    });

    return NextResponse.json(
      {
        ...stream,
        hasUpvoted: false,
        upvotes: 0,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);

    return NextResponse.json(
      {
        message: "Error while adding the stream",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json(
      {
        message: "Error!",
      },
      {
        status: 411,
      }
    );
  }
  const [streams, activeStream] = await Promise.all([
  prismaClient.stream.findMany({
    where: {
      userId: creatorId,
      played: false,
    },
    include: {
      _count: {
        select: {
          upvotes: true,
        },
      },
      upvotes: {
        where: {
          userId: user?.id,
        },
      },
    },
  }),
  prismaClient.currentStream.findFirst({
    where: {
      userId: creatorId,
    },
    include: {
      stream: true,
    },
  })
]);


  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      hasUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  });
}
