import { web3, AnchorProvider, Program, Idl } from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useEffect, useMemo, useState } from 'react';

export default function useAnchorProgram(_programId: string) {
  const wallet = useAnchorWallet();
  const [idl, setIdl] = useState<Idl | null>(null);

  const opts = AnchorProvider.defaultOptions();
  const programId = useMemo(() => new web3.PublicKey(_programId), [_programId]);
  const connection = useMemo(
    () =>
      new web3.Connection(
        web3.clusterApiUrl('devnet'),
        opts.preflightCommitment
      ),
    [opts.preflightCommitment]
  );
  const provider = useMemo(
    () => (wallet ? new AnchorProvider(connection, wallet, opts) : undefined),
    [connection, opts, wallet]
  );

  useEffect(() => {
    Program.fetchIdl(programId, provider).then((val: Idl | null) => {
      setIdl(val);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const program = useMemo(
    () => (idl ? new Program(idl, programId, provider) : undefined),
    [idl, programId, provider]
  );

  return program;
}
