module StashEngine
  module SerializerMixin

    def initialize(my_model)
      @my_model = my_model
    end

    def generic_hash
      @my_model.slice(*self.class::COLUMNS)
    end

  end
end