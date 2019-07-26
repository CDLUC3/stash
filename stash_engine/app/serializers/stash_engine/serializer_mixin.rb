module StashEngine
  module SerializerMixin

    def initialize(my_model)
      @my_model = my_model
    end

    def hash
      return nil if @my_model.nil?
      @my_model.slice(*self.class::COLUMNS)
    end

  end
end