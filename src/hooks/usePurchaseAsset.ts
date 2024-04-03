import { web3 } from '@project-serum/anchor';
import { useEffect, useMemo, useState } from 'react';

import useAnchorProgram from './useAnchorProgram';

const PROGRAM_ID = '7aPV6jteNANJboKezyvLet2NR4qrZqQPPaMyPQtvp65G';
const FEE_CONTROLLER_PDA_SEED = 'fee_controller_pda_seed';

export default function usePurchaseAsset() {
  const program = useAnchorProgram(PROGRAM_ID);

  const FEE_RX_ADDRESS = useMemo(
    () => new web3.PublicKey('HuUQsiJMAGx1g91SaTeXg1MLurVf14or1Fo336K4rfmU'),
    []
  );
  const [feeControllerPDA, setFeeControllerPDA] = useState<web3.PublicKey>();

  useEffect(() => {
    if (!program) return;
    if (!feeControllerPDA) {
      web3.PublicKey.findProgramAddress(
        [Buffer.from(FEE_CONTROLLER_PDA_SEED)],
        program.programId
      ).then(([val]) => setFeeControllerPDA(val));
    }
  }, [feeControllerPDA, program]);

  const execute = async () => {
    if (!program) return;

    const transaction_type = 'IMAGE_2K_W_WATERMARK';
    return await program.methods
      .purchaseAsset(transaction_type)
      .accounts({
        signer: program.provider.publicKey,
        feeController: feeControllerPDA,
        feeReceiverAddress: FEE_RX_ADDRESS,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  };

  return execute;
}
