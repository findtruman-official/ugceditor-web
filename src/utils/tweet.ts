
export const getSubmissionTweetUrl = (submissionId: string) => {
  return (
    `https://twitter.com/intent/tweet?text=` +
    encodeURIComponent(
      `I am participating the AIGC competition — “TopScore Psyche”. Carve up the value of $1,000 prize pool!\n\n` +
        `This is my AI artwork, come and vote for me! 👉https://aiverse.me/s/t/sm/${submissionId}\n\n` +
        `Join:AIVERSE.me/activity (PC, Chrome)\n\n` +
        `@AIVERSE_me @FindTruman @Knn3Network\n`,
    ) +
    `&hashtags=AIGC,NFT`
  );
};
