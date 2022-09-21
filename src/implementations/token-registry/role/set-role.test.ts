import { TradeTrustERC721__factory } from "@govtechsg/token-registry/contracts";
import { Wallet } from "ethers";
import { TokenRegistrySetRoleAdminCommand } from "../../../commands/token-registry/token-registry-command.type";
import { setRoleAdminTokenRegistry } from "./set-role";

jest.mock("@govtechsg/token-registry/contracts");
const roleParams: TokenRegistrySetRoleAdminCommand = {
  address: "0x1122",
  role: "0x1",
  adminRole: "0x2",
  network: "ropsten",
  gasPriceScale: 1,
  dryRun: false,
};



describe("token-registry", () => {
  describe("set role for token registry", () => {
    const mockedTradeTrustERC721Factory: jest.Mock<TradeTrustERC721__factory> = TradeTrustERC721__factory as any;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock static method
    const mockedConnectERC721: jest.Mock = mockedTradeTrustERC721Factory.connect;
    const mockGrantRole = jest.fn();
    const mockCallStaticGrantRole = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      delete process.env.OA_PRIVATE_KEY;
      mockedTradeTrustERC721Factory.mockReset();
      mockedConnectERC721.mockReset();

      mockGrantRole.mockReturnValue({
        hash: "hash",
        wait: () => Promise.resolve({ transactionHash: "transactionHash" }),
      });

      mockedConnectERC721.mockReturnValue({
        setRoleAdmin: mockGrantRole,
        callStatic: {
          setRoleAdmin: mockCallStaticGrantRole,
        },
      });
      mockGrantRole.mockClear();
      mockCallStaticGrantRole.mockClear();
    });

    it("should pass in the correct params and successfully accepts set role", async () => {
      const privateKey = "0000000000000000000000000000000000000000000000000000000000000001";
      await setRoleAdminTokenRegistry({
        ...roleParams,
        key: privateKey,
      });

      const passedSigner: Wallet = mockedConnectERC721.mock.calls[0][1];

      expect(passedSigner.privateKey).toBe(`0x${privateKey}`);
      expect(mockedConnectERC721).toHaveBeenCalledWith(roleParams.address, passedSigner);
      expect(mockCallStaticGrantRole).toHaveBeenCalledTimes(1);
      expect(mockGrantRole).toHaveBeenCalledTimes(1);

      expect(mockGrantRole.mock.calls[0][0]).toEqual(roleParams.role);
      expect(mockGrantRole.mock.calls[0][1]).toEqual(roleParams.adminRole);
    });
  });
});
