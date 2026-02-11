import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { ChainReaction, FactoryChainReaction } from '../artifacts/ts'
import { stringToHex, NULL_CONTRACT_ADDRESS, ALPH_TOKEN_ID } from '@alephium/web3'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFactory: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings


  const chainReactionTemplateId = deployer.getDeployContractResult('ChainReaction')

  const result = await deployer.deployContract(FactoryChainReaction,{
    initialFields: {
      playContractTemplateId: chainReactionTemplateId.contractInstance.contractId,
      numberGames: 0n
    }
  })
  console.log('contract id: ' + result.contractInstance.contractId)
  console.log('contract address: ' + result.contractInstance.address)
}

export default deployFactory
