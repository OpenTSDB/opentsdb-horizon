import { LoggerService } from '../../../../core/services/logger.service';
import { UniversalDataTooltipService } from './universal-data-tooltip.service';
import { TooltipDispatcher } from '../components/tooltip-dispatcher/tooltip-dispatcher';

const UniversalDataTooltipServiceFactory = (
    componentFactory: TooltipDispatcher,
    logger: LoggerService
) => {
    return new UniversalDataTooltipService(componentFactory, logger);
};

export let UniversalDataTooltipServiceProvider = {
    provide: UniversalDataTooltipService,
    useFactory: UniversalDataTooltipServiceFactory,
    deps: [
        TooltipDispatcher,
        LoggerService
    ]
};
