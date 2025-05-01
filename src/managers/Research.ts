import { create } from "zustand"
import { produce } from "immer"

interface BearState {
    bears: number
}


// This is a Singleton

class BearService {

    private _stateRef = { current: null }

    constructor(state: BearState) {
        this._stateRef.current = state
    }

    get state() { return useBearStore.getState() }

    public getState = () => {
        return this._stateRef.current
    }

    public addBear = () => {
        this._stateRef.current = produce(
            this._stateRef.current, (state: BearState) => {
                state.bears++
            })
        useBearStore.setState(this._stateRef.current)
    }

    public removeBear = () => {
        this._stateRef.current = produce(
            this._stateRef.current, (state: BearState) => {
                state.bears--
            })
        useBearStore.setState(this._stateRef.current)
    }

    // Force a state change, this is used to trigger a re-render
    public triggerStateChange = () => {
        this._stateRef.current = produce(
            this._stateRef.current, (state: BearState) => {
                // No-op but still creates a new reference
            })
        useBearStore.setState(this._stateRef.current)
    }

    public hydrateSelfState = (state: BearState) => {
        this._stateRef.current = state
    }

}

const bearServiceInstance = new BearService({
    bears: 0,
})


export const useBearStore = create<BearState>((set) => bearServiceInstance.getState())


useBearStore.subscribe(bearServiceInstance.hydrateSelfState)