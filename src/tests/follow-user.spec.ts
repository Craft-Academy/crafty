describe("Feature: Following a user", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });
  test("Alice can follow Bob", async () => {
    fixture.givenUserFollowees({
      user: "Alice",
      followees: ["Charlie"],
    });

    await fixture.whenUserFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "Alice",
      followees: ["Charlie", "Bob"],
    });
  });
});

const createFixture = () => {
  return {
    givenUserFollowees({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {},
    async whenUserFollows(followCommand: {
      user: string;
      userToFollow: string;
    }) {},
    async thenUserFolloweesAre(userFollowees: {
      user: string;
      followees: string[];
    }) {},
  };
};

type Fixture = ReturnType<typeof createFixture>;
