import { getContract } from "../lib/contract";

export const runtime = "edge";

export async function getServerSideProps(context) {
  const { shortCode } = context.params;
  const contract = getContract();
  const longUrl = await contract.getURL(shortCode);

  if (longUrl && longUrl.length > 0) {
    return {
      redirect: {
        destination: longUrl,
        permanent: false,
      },
    };
  } else {
    return {
      props: {
        shortCode,
      },
    };
  }
}

export default function ShortCodePage({ shortCode }) {
  return (
    <div style={{ margin: "40px", fontFamily: "sans-serif" }}>
      <h1>Short Code Not Found</h1>
      <p>The short code "{shortCode}" does not exist.</p>
      <p>
        <a href="/">Go back home</a>
      </p>
    </div>
  );
}
